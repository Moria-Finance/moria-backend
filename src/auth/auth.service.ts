import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Address, verify_signature } from 'ergo-lib-wasm-nodejs';
import { ErgoAddress, ErgoTree, Network } from '@fleet-sdk/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { encode, decode } from 'cbor-x';
import { EXPIRATION_TIME, STATEMENT, VALID_PERIOD } from './auth.constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { AuthMetadata, ErgoPayAuth, Signature } from '../types/auth.dto';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly TIMESTAMP: number = 2;
  private readonly ORIGIN: number = 1;
  private readonly SELF_URL: string;
  private readonly SUPABASE_JWT_SECRET: string;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.SELF_URL = configService.get<string>('SELF_URL');
    this.SUPABASE_JWT_SECRET = configService.get<string>('SUPABASE_JWT_SECRET');
  }

  public verifySignature(signature: Signature, address: string): boolean {
    this.validateAddress(address);
    try {
      // const arr: string[] = signature.signedMessage.split(';');

      // const timestamp = parseInt(arr[this.TIMESTAMP], 10) * 1000;
      // const origin = arr[this.ORIGIN];

      // const moreThen10SecPassed = false;
      //
      // if (moreThen10SecPassed) {
      //   return false;
      // }

      const networkAddress =
        ErgoAddress.getNetworkType(address) === Network.Mainnet
          ? Address.from_mainnet_str(address)
          : Address.from_testnet_str(address);

      return verify_signature(
        networkAddress,
        Buffer.from(signature.signedMessage, 'utf-8'),
        Buffer.from(signature.proof, 'hex'),
      );
    } catch (e) {
      this.logger.error(`Verification Error: ${e}`);
      return false;
    }
  }

  public async verifySignatureMetadata(
    metadata: string,
    address: string,
    ergopay: boolean,
  ) {
    this.validateAddress(address);
    let userData: {
      address: string;
      metadata: AuthMetadata;
      client_id: string | undefined;
    };
    let user: boolean;

    try {
      userData = (await this.getUserData(address)) as any;
      user = await this.checkConfirmedUser(address);
    } catch (e) {
      this.logger.error(`Verification error: ${e}`);
      throw new BadRequestException(
        'Error fetching user from unconfirmed_users table',
        {
          cause: e?.message,
          description: 'database',
        },
      );
    }

    let encodedMetadata: AuthMetadata;

    try {
      if (ergopay) {
        encodedMetadata = userData.metadata;
      } else {
        encodedMetadata = decode(hexToBytes(metadata)) as AuthMetadata;
      }
    } catch (error) {
      this.logger.error(`Error decoding metadata: ${error}`);
      throw new BadRequestException('Error decoding cborg metadata', {
        cause: error?.message,
        description: 'decoding error',
      });
    }

    let validation = false;
    try {
      if (!ergopay) {
        validation =
          userData.metadata.nonce == encodedMetadata.nonce &&
          userData.metadata.network == encodedMetadata.network &&
          userData.metadata.address == encodedMetadata.address &&
          userData.metadata.expirationTime == encodedMetadata.expirationTime &&
          userData.metadata.statement == encodedMetadata.statement &&
          userData.metadata.notBefore == encodedMetadata.notBefore &&
          userData.metadata.validityTimeFrame ==
            encodedMetadata.validityTimeFrame;
      } else {
        validation = true;
      }
    } catch (e) {
      this.logger.error(`Issue validating: ${e}`);
      throw new BadRequestException('Issue Validating', {
        cause: e?.message,
        description: 'Issue Validating',
      });
    }

    if (!validation) {
      this.logger.error(`Metadata data does not match`);
      throw new BadRequestException('Issue Validating', {
        cause: 'Metadata data does not match',
        description: 'Metadata data does not match',
      });
    }

    if (new Date().getTime() > userData.metadata.validityTimeFrame * 1000) {
      this.logger.error('Taken too long to sign');
      throw new BadRequestException('Taken too long to sign', {
        cause: 'Taken too long to sign',
        description: 'Taken too long to sign',
      });
    }

    const token = jwt.sign(
      {
        ...encodedMetadata,
        aud: 'authenticated',
        role: 'authenticated',
        exp: userData.metadata.expirationTime,
      },
      this.SUPABASE_JWT_SECRET,
    );

    if (!user) {
      try {
        await this.writeConfirmedUserData(
          address,
          encodedMetadata,
          token,
          userData.client_id,
        );
      } catch (e) {
        this.logger.error(`Error writing to confirmed users: ${e}`);
        throw new BadRequestException('Error writing to confirmed users', {
          cause: e?.message,
          description: 'database',
        });
      }
    } else {
      try {
        await this.updateConfirmedUserData(
          address,
          encodedMetadata,
          token,
          userData.client_id,
        );
      } catch (e) {
        this.logger.error(`Error updating confirmed_users: ${e}`);
        throw new BadRequestException('Error updating confirmed_users', {
          cause: e?.message,
          description: 'database',
        });
      }
    }

    return token;
  }
  private async getUserData(address: string): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('unconfirmed_users')
      .select('*')
      .eq('address', address);
    if (error) {
      throw error;
    }
    return data[0];
  }

  private async createUser(address: string): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.admin.createUser({
        email: `${address}@ergoplatform.com`,
        user_metadata: { address: address },
      });
    if (error) {
      console.log(JSON.stringify(error));
      throw error;
    }
    return data.user.id;
  }

  private async writeConfirmedUserData(
    address: string,
    metadata: AuthMetadata,
    token: string,
    client_id: string | undefined,
  ): Promise<void> {
    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('confirmed_users')
      .insert({
        address,
        metadata,
        token,
        client_id,
      });

    if (updateError) {
      throw updateError;
    }
  }

  private async updateConfirmedUserData(
    address: string,
    metadata: AuthMetadata,
    token,
    client_id: string | undefined,
  ): Promise<void> {
    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('confirmed_users')
      .update({
        metadata,
        token,
        client_id,
      })
      .eq('address', address); // primary key

    if (updateError) {
      throw updateError;
    }
  }

  private async checkConfirmedUser(address: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('confirmed_users')
      .select('address')
      .eq('address', address);

    return !(error || data.length === 0);
  }

  public async getNonce(
    address: string,
    ergopay: boolean,
    client_id?: string,
  ): Promise<AuthMetadata> {
    this.validateAddress(address);

    const networkAddress =
      ErgoAddress.getNetworkType(address) === Network.Mainnet;

    const nonce = Math.floor(Math.random() * 1000000).toString();

    const now = Math.floor(Date.now() / 1000); // current timestamp in seconds

    const metadata: AuthMetadata = {
      address: address,
      network: networkAddress ? 'mainnet' : 'testnet',
      statement: STATEMENT,
      nonce: nonce,
      notBefore: now,
      expirationTime: now + EXPIRATION_TIME,
      validityTimeFrame: now + VALID_PERIOD,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('unconfirmed_users')
      .select('address')
      .eq('address', address);

    if (error || data.length === 0) {
      // Address not found, create new entry
      const { error: insertError } = await this.supabaseService
        .getClient()
        .from('unconfirmed_users')
        .insert({
          address: address,
          metadata,
          ergopay,
          client_id,
        });

      if (insertError) {
        this.logger.error(
          `Issue writing new entry for table unconfirmed_users: ${insertError}`,
        );
        throw new BadRequestException(
          'Issue writing new entry for table unconfirmed_users',
          {
            cause: insertError?.message,
            description: 'database',
          },
        );
      }
    } else {
      // Address found, update the entry
      const updateRes = await this.supabaseService
        .getClient()
        .from('unconfirmed_users')
        .update({
          metadata,
          ergopay,
          client_id,
        })
        .eq('address', address);

      if (updateRes.error) {
        this.logger.error(`Issue updating nonce: ${updateRes.error}`);
        throw new BadRequestException('Issue updating nonce', {
          cause: updateRes.error?.message,
          description: 'database',
        });
      }
    }
    return metadata;
  }

  public getErgoPayFormat(metadata: AuthMetadata): ErgoPayAuth {
    try {
      const encodedMetadataHex = bytesToHex(encode(metadata));

      const replyTo = `${this.SELF_URL}/auth/ergopay/login/?address=${metadata.address}`;
      const addr = ErgoAddress.fromBase58(metadata.address);
      const tree = new ErgoTree(addr.ergoTree);
      const treeBytes = Array.from(tree.toBytes());
      treeBytes.shift();
      treeBytes.shift();
      const sigmaBoolean = Buffer.from(treeBytes).toString('base64');
      return {
        address: metadata.address,
        signingMessage: encodedMetadataHex,
        sigmaBoolean: sigmaBoolean,
        userMessage: STATEMENT,
        messageSeverity: 'INFORMATION',
        replyTo,
      };
    } catch (e) {
      this.logger.error(`Issue generating ergopay format: ${e}`);
      throw new BadRequestException('Issue generating ergopay format', {
        cause: e?.message,
        description: 'ergopay generation',
      });
    }
  }

  public convertToNautilusSignature(signature: Signature): Signature {
    try {
      return {
        signedMessage: signature.signedMessage,
        proof: bytesToHex(Buffer.from(signature.proof, 'base64')),
      };
    } catch (e) {
      this.logger.error(`Issue converting to nautilus format: ${e}`);
      throw new BadRequestException('Issue converting to nautilus format', {
        cause: e?.message,
        description: 'serialization',
      });
    }
  }

  private validateAddress(address: string): void {
    try {
      const validation = ErgoAddress.validate(address);
      if (!validation) {
        throw new Error();
      }
    } catch (error) {
      throw new BadRequestException('Invalid Ergo Address', {
        cause: 'Invalid Ergo Address',
        description: 'Invalid Ergo Address',
      });
    }
  }
}
