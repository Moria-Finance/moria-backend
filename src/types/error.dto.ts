import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    example: 'Inserting UUID and B64 Failed',
    description: 'The error message indicating the general error category',
  })
  message: string;

  @ApiProperty({
    example: 'database',
    description: 'The reason why message thrown',
  })
  error: string;

  @ApiProperty({
    example: 400,
    description: 'status code',
  })
  statusCode: number;
}
