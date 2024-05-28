import { Module } from '@nestjs/common';
import { ErgoPayController } from './ergopay.controller';
import { ErgoPayService } from './ergopay.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ErgoPayController],
  providers: [ErgoPayService, SupabaseService],
})
export class ErgoPayModule {}
