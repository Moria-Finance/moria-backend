import { Controller, Get, Param } from '@nestjs/common';
import { ErgoPayService } from './ergopay.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  AddressLinkResponseDto,
  GenerateAddressResponseDto,
  GenerateShortLinkResponseDto,
  ReducedTxLinkResponseDto,
} from '../types/ergopay.dto';
import { ErrorResponse } from '../types/error.dto';

@ApiTags('ErgoPay')
@Controller('ergopay')
export class ErgoPayController {
  constructor(private readonly ergoPayService: ErgoPayService) {}

  @ApiCreatedResponse({
    status: 200,
    description: 'Write B64 unsigned tx to db and return UUID associated to it',
    type: GenerateShortLinkResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Get('generateShortLink/:base64Data')
  async generateShortLink(
    @Param('base64Data') base64Data: string,
  ): Promise<GenerateShortLinkResponseDto> {
    const shortCode = await this.ergoPayService.generateErgoPayShortLink(
      base64Data,
    );
    return { shortCode: shortCode };
  }

  @ApiCreatedResponse({
    status: 200,
    description: 'Associate UUID with an address in the db',
    type: AddressLinkResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Get('generateAddressLink/:uuid/:address')
  async generateAddressLink(
    @Param('uuid') uuid: string,
    @Param('address') address: string,
  ): Promise<AddressLinkResponseDto> {
    const shortCode = await this.ergoPayService.createAddressLink(
      uuid,
      address,
    );
    if (shortCode) {
      return { message: 'success' };
    }
  }

  @ApiCreatedResponse({
    status: 200,
    description: 'Get address based on UUID',
    type: GenerateAddressResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Get('address/:uuid')
  async getAddress(
    @Param('uuid') uuid: string,
  ): Promise<GenerateAddressResponseDto> {
    const shortCode = await this.ergoPayService.getAddress(uuid);
    return { address: shortCode };
  }

  @ApiCreatedResponse({
    status: 200,
    description:
      'Get reduced tx link for Ergo Mobile Wallet from uuid, message, and address',
    type: ReducedTxLinkResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'returns error message',
    type: ErrorResponse,
  })
  @Get('reducedTxLink/:uuid/:message/:address')
  async getReducedTxLink(
    @Param('uuid') uuid: string,
    @Param('message') message: string,
    @Param('address') address: string,
  ): Promise<ReducedTxLinkResponseDto> {
    return this.ergoPayService.getReducedTxLink(uuid, message, address);
  }
}
