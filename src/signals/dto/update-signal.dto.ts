/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSignalDto {
  @ApiPropertyOptional({
    example: 'device-afc-123',
    description: 'The unique identifier of the IoT device.',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'The timestamp of the signal event.' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  time?: Date;

  @ApiPropertyOptional({
    example: 155,
    description: 'The number of data points in the raw signal.',
  })
  @IsNumber()
  @IsOptional()
  dataLength?: number;

  @ApiPropertyOptional({
    example: 4120,
    description: 'The size of the raw signal data in bytes.',
  })
  @IsNumber()
  @IsOptional()
  dataVolume?: number;
}
