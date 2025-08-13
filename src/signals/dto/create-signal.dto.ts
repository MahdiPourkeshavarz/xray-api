/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsString, IsDate, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSignalDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  time: Date;

  @IsNumber()
  @IsNotEmpty()
  dataLength: number;

  @IsNumber()
  @IsNotEmpty()
  dataVolume: number;

  @IsNumber()
  @IsNotEmpty()
  averageSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  durationMs: number;

  @IsNumber()
  @IsNotEmpty()
  maxSpeed: number;
}
