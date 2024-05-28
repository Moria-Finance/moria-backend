import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Configuration, DefaultApiFactory } from '../explorerApi';
import { ConfigService } from '@nestjs/config';
import { ExplorerClient } from '../types/explorer.dto';
import { ErgoAddress } from '@fleet-sdk/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ReducedTxLinkResponseDto } from '../types/ergopay.dto';
import * as console from 'node:console';

@Injectable()
export class ErgoPayService {
  private readonly explorerConf: Configuration;
  private readonly explorerClient: ExplorerClient;
  private readonly logger = new Logger(ErgoPayService.name);
  constructor(
    private configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.explorerConf = new Configuration({
      basePath: this.configService.get<string>('EXPLORER_API_URL'),
    });
    this.explorerClient = DefaultApiFactory(this.explorerConf) as any;
  }

  async generateErgoPayShortLink(base64Txn: string): Promise<string> {
    const uuid = uuidv4().substr(0, 6);

    const { error } = await this.supabaseService
      .getClient()
      .from('ergopay')
      .insert([
        {
          uuid: uuid,
          base_64: `ergopay:${base64Txn}`,
        },
      ])
      .select();

    if (error) {
      this.logger.error(`supabase error: ${error}`);
      throw new BadRequestException('Inserting UUID and B64 Failed', {
        cause: error?.message,
        description: 'database',
      });
    }

    return uuid;
  }

  async createAddressLink(uuid: string, address: string): Promise<string> {
    if (!ErgoAddress.validate(address)) {
      throw new BadRequestException('Invalid Ergo Address', {
        cause: 'Invalid Ergo Address',
        description: 'Invalid Ergo Address',
      });
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('ergopay_address')
      .insert([
        {
          uuid: uuid,
          address: address,
        },
      ])
      .select();

    if (error) {
      this.logger.error(`supabase error: ${error}`);
      throw new BadRequestException('Inserting Address and UUID Failed', {
        cause: error?.message,
        description: 'datbase',
      });
    }
    return uuid;
  }

  async getAddress(uuid: string): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('ergopay_address')
      .select('*')
      .eq('uuid', uuid);

    if (error || !data || !data[0]) {
      this.logger.error(`supabase error: ${error ? data : (!data ? 'no data' : (!data[0] ? 'no data' : null))}`);
      throw new BadRequestException('Selecting Address Failed', {
        cause: error?.message,
        description: 'database',
      });
    }

    return data[0].address;
  }

  async getReducedTxLink(
    uuid: string,
    message: string,
    address: string,
  ): Promise<ReducedTxLinkResponseDto> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('ergopay')
      .select('*')
      .eq('uuid', uuid);

    if (error) {
      this.logger.error(`supabase error: ${error}`);
      throw new BadRequestException('Selecting UUID from db failed', {
        cause: error?.message,
        description: 'database',
      });
    }

    try {
      const reducedTx: string = data[0].base_64.slice(8);
      if (!message) {
        throw new Error('undefined message');
      }
      if (!address) {
        throw new Error('undefined address');
      }
      return {
        reducedTx: reducedTx,
        message: message,
        messageSeverity: 'INFORMATION',
        address: address,
      };
    } catch (error) {
      this.logger.error(`supabase error: ${error}`);
      throw new BadRequestException('Undefined reduced variable(s)', {
        cause: error?.message,
        description: 'undefined variables',
      });
    }
  }
}
