import { ApiProperty } from '@nestjs/swagger';

export class AddressLinkResponseDto {
  @ApiProperty({
    description: 'message indicating success',
    example: 'success',
  })
  message: string;
}

export class GenerateAddressResponseDto {
  @ApiProperty({
    description: 'address based on uuid',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
}

export class GenerateShortLinkResponseDto {
  @ApiProperty({
    description: 'uuid from b64 unsigned tx',
    example: '4ae5f5d0-0256-4d7e-b893-76e6f2c78064',
  })
  shortCode: string;
}

export class ReducedTxLinkResponseDto {
  @ApiProperty({
    description: 'reduced tx',
    example: '',
  })
  reducedTx: string;
  @ApiProperty({
    description: 'message displayed in Ergo Mobile Wallet UI',
    example: 'Sign this tx',
  })
  message: string;
  @ApiProperty({
    description: 'message severity in Ergo Mobile Wallet UI',
    example: 'INFORMATION', // NONE, INFORMATION, WARNING, ERROR
  })
  messageSeverity: string;
  @ApiProperty({
    description: 'address which must signed the b64 txn',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
}
