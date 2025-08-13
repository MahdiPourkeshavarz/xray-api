/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsString, IsDate, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSignalDto {
  @ApiProperty({
    example: 'device-afc-123',
    description: 'The unique identifier of the IoT device.',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'The timestamp of the signal event.' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  time: Date;

  @ApiProperty({
    example: 150,
    description: 'The number of data points in the raw signal.',
  })
  @IsNumber()
  @IsNotEmpty()
  dataLength: number;

  @ApiProperty({
    example: 4096,
    description: 'The size of the raw signal data in bytes.',
  })
  @IsNumber()
  @IsNotEmpty()
  dataVolume: number;

  @ApiProperty({
    example: 3.14,
    description: 'The calculated average speed from all data points.',
  })
  @IsNumber()
  @IsNotEmpty()
  averageSpeed: number;

  @ApiProperty({
    example: 2500,
    description: 'The calculated duration of the scan in milliseconds.',
  })
  @IsNumber()
  @IsNotEmpty()
  durationMs: number;

  @ApiProperty({
    example: 5.2,
    description: 'The maximum speed recorded in the signal.',
  })
  @IsNumber()
  @IsNotEmpty()
  maxSpeed: number;
}
