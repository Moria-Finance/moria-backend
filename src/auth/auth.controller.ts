import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthMetadata,
  ErgoPayAuth,
  LoginBody,
  LoginResponse,
  NonceBody,
  Signature,
} from '../types/auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../types/error.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    status: 200,
    description: 'Returns login token upon valid signature',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Post('login')
  async authenticate(@Body() body: LoginBody): Promise<LoginResponse> {
    const { signature, metadata, address } = body;
    const verificationStatus: boolean = this.authService.verifySignature(
      signature,
      address,
    );
    if (!verificationStatus) {
      throw new BadRequestException('Verification Failed', {
        cause: 'Invalid Signature',
        description: 'Invalid Signature',
      });
    }

    const token = await this.authService.verifySignatureMetadata(
      metadata,
      address,
      false,
    );

    return {
      authToken: token,
    };
  }

  @ApiCreatedResponse({
    status: 200,
    description: 'Returns nonce for a given address and saves to db',
    type: AuthMetadata,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Post('nonce')
  async nonce(@Body() body: NonceBody): Promise<AuthMetadata> {
    return this.authService.getNonce(body.address, false);
  }

  @ApiCreatedResponse({
    status: 200,
    description: 'Returns message for wallet to sign',
    type: ErgoPayAuth,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Get('ergopay/:address/:client_id')
  async ergopay(
    @Param('address') address: string,
    @Param('client_id') clientId: string,
  ): Promise<ErgoPayAuth> {
    // You can now use clientId in your logic
    const metadata = await this.authService.getNonce(address, true, clientId);
    return this.authService.getErgoPayFormat(metadata);
  }

  @ApiCreatedResponse({
    status: 200,
    description: 'Returns login token upon valid signature',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Post('ergopay/login')
  async ergopayLogin(
    @Query('address') address: string,
    @Body() body: Signature,
  ): Promise<LoginResponse> {
    const nautilusSignature = this.authService.convertToNautilusSignature(body);
    const verificationStatus: boolean = this.authService.verifySignature(
      nautilusSignature,
      address,
    );
    if (!verificationStatus) {
      throw new HttpException(
        'address verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = await this.authService.verifySignatureMetadata(
      null,
      address,
      true,
    );

    return {
      authToken: token,
    };
  }
}
