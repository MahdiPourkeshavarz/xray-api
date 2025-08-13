/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { Signal, SignalDocument } from './schema/signal.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SignalsService {
  constructor(
    @InjectModel(Signal.name)
    private readonly signalModel: Model<SignalDocument>,
  ) {}

  create(createSignalDto: CreateSignalDto): Promise<Signal> {
    const createdSignal = new this.signalModel(createSignalDto);
    return createdSignal.save();
  }

  findAll() {
    return `This action returns all signals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} signal`;
  }

  update(id: number, updateSignalDto: UpdateSignalDto) {
    return `This action updates a #${id} signal`;
  }

  remove(id: number) {
    return `This action removes a #${id} signal`;
  }
}
