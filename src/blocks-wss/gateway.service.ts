import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Subscriber } from 'zeromq';
import { SupabaseService } from '../supabase/supabase.service';
import { ERGO_PAY_SUB_PERIOD } from '../auth/auth.constants';
import { ConfigService } from '@nestjs/config';
import * as console from 'node:console';

@Injectable()
export class GatewayService implements OnModuleInit {
  private readonly NODE_API_URL: string;
  private readonly NODE_LISTENER_URL: string;
  private clients: Map<string, { socket: Socket; timestamp: number }> =
    new Map();
  private server: Server;

  constructor(
    private readonly supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    this.NODE_API_URL = configService.get<string>('NODE_API_URL');
    this.NODE_LISTENER_URL = configService.get<string>('NODE_LISTENER_URL');
  }

  setServer(server: Server) {
    this.server = server;
    this.setupConnectionHandler();
  }

  onModuleInit() {
    this.startSocket();
    this.startSupabaseSubscription();
  }

  private async startSocket(): Promise<void> {
    const sock = new Subscriber();

    // Connect to the server
    sock.connect(this.NODE_LISTENER_URL);

    sock.subscribe('newBlock');

    for await (const [topic, msg] of sock) {
      // Convert the topic and message to strings
      const topicStr = topic.toString();
      const msgStr = msg.toString();

      if (topicStr === 'newBlock') {
        const blockHash = msgStr.slice(0, 64);
        this.updateBlock(blockHash);
      }
    }
  }

  private setupConnectionHandler() {
    this.server.on('connection', (socket: Socket) => {
      // When a new client connects
      this.clients.set(socket.id, {
        socket,
        timestamp: Date.now() + ERGO_PAY_SUB_PERIOD,
      });
      this.emitClientId(socket.id);

      // Handle client disconnection
      socket.on('disconnect', () => {
        this.clients.delete(socket.id);
      });
    });
  }
  emitClientId(client_id: string) {
    this.server.to(client_id).emit('client_id', client_id);
  }

  startSupabaseSubscription() {
    this.supabaseService
      .getClient()
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'confirmed_users',
        },
        (payload) => {
          console.log('got payload');
          const clientId = (payload as any).new.client_id;

          if (
            clientId &&
            this.clients.has(clientId) &&
            this.clients.get(clientId).timestamp > Date.now()
          ) {
            this.server
              .to(clientId)
              .emit('payload', (payload as any).new.token);
            this.clients.delete(clientId);
          } else {
            this.clients.delete(clientId);
            this.server.to(clientId).emit('close_modal', true);
          }
        },
      )
      .subscribe();
  }

  updateBlock(blockHash: string) {
    this.server.emit('new_block', blockHash);
  }
}
