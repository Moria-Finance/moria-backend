import { Module } from '@nestjs/common';
import { BlockGateway } from './gateway';
import { GatewayService } from './gateway.service';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BlockGateway, GatewayService, AuthService, SupabaseService],
})
export class GatewayModule {}
