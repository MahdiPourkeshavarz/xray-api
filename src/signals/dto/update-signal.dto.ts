/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateSignalDto } from './create-signal.dto';

export class UpdateSignalDto extends PartialType(CreateSignalDto) {}
