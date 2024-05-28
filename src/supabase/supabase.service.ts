import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_KEY, SUPABASE_LINK } from '../constants';

@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(SUPABASE_LINK(), SUPABASE_SERVICE_KEY());
  }

  public getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
