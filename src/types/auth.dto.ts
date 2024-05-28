import { DataSignature } from '@meshsdk/core';
import { ApiProperty } from '@nestjs/swagger';

export class Signature {
  @ApiProperty({
    description: 'Message which client signs',
    example: '',
  })
  signedMessage: string;
  @ApiProperty({
    description: 'signed message from client',
    example: '',
  })
  proof: string;
}
export class AuthMetadata {
  @ApiProperty({
    description: 'primary address of wallet which signed',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
  @ApiProperty({
    description: 'chain network',
    example: 'mainnet',
  })
  network: string;
  @ApiProperty({
    description: 'statement user will sign',
    example: 'Please sign this message to verify address ownership.',
  })
  statement: string;
  @ApiProperty({
    description: 'Number only used once, saved in db based on address',
    example: 32421,
  })
  nonce: string;
  @ApiProperty({
    description: 'Timestamp lower bound',
    example: 32421,
  })
  notBefore: number;
  @ApiProperty({
    description: 'Timestamp determining when token will be inactive in browser',
    example: 32421,
  })
  expirationTime: number;
  @ApiProperty({
    description: 'Timestamp by when user must sign',
    example: 32421,
  })
  validityTimeFrame: number;
}
export class LoginBody {
  @ApiProperty({
    description: 'signed message from client',
    example: {
      signedMessage: 'string',
      proof: '',
    },
  })
  signature: Signature;

  @ApiProperty({
    description: 'metadata from client',
    example: 'some metadata',
  })
  metadata: string;

  @ApiProperty({
    description: 'primary address of wallet which signed',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
}

export class LoginResponse {
  @ApiProperty({
    description: 'auth token from backend upon successful response',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  authToken: string;
}

export interface CardanoLoginBody {
  signedMessage: DataSignature;
  metadata: string;
  address: string;
}

export class ErgoPayAuth {
  @ApiProperty({
    description: 'primary address of wallet which signed',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
  @ApiProperty({
    description: 'message user will sign',
    example: 'Please sign this message to verify address ownership.',
  })
  signingMessage: string;
  @ApiProperty({
    description: 'data wallet will verify',
    example: 'Please sign this message to verify address ownership.',
  })
  sigmaBoolean: string;
  @ApiProperty({
    description: 'statement user will sign',
    example: 'Please sign this message to verify address ownership.',
  })
  userMessage: string;
  @ApiProperty({
    description: 'message severity in Ergo Mobile Wallet UI',
    example: 'INFORMATION', // NONE, INFORMATION, WARNING, ERROR
  })
  messageSeverity: string;

  @ApiProperty({
    description: 'The url Ergo Mobile Wallet will hit upon success',
    example: 'https://someurl.com', // NONE, INFORMATION, WARNING, ERROR
  })
  replyTo: string;
}

export class NonceBody {
  @ApiProperty({
    description: 'primary address of wallet which signed',
    example: '9hzsD2FKTPyk9Q92ccRofGvkenJ5F9HBTqaqcBenNE96CHC54yj',
  })
  address: string;
}
