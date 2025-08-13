/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { SignalsService } from 'src/signals/signals.service';

@Module({
  providers: [RabbitmqService],
  imports: [SignalsService],
})
export class RabbitmqModule {}
