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

export class UpdateSignalDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  deviceId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  time?: Date;

  @IsNumber()
  @IsOptional()
  dataLength?: number;

  @IsNumber()
  @IsOptional()
  dataVolume?: number;
}
