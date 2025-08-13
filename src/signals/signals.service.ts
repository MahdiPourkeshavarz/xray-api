/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { Signal, SignalDocument } from './schema/signal.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindAllFilters } from './dto/find-all.dto';

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

  async findAll(filters: FindAllFilters): Promise<Signal[]> {
    const queryFilter: any = {};

    if (filters.deviceId) {
      queryFilter.deviceId = filters.deviceId;
    }
    if (filters.startDate || filters.endDate) {
      queryFilter.time = {};
      if (filters.startDate)
        queryFilter.time.$gte = new Date(filters.startDate);
      if (filters.endDate) queryFilter.time.$lte = new Date(filters.endDate);
    }

    if (filters.minAverageSpeed || filters.maxAverageSpeed) {
      queryFilter.averageSpeed = {};
      if (filters.minAverageSpeed)
        queryFilter.averageSpeed.$gte = filters.minAverageSpeed;
      if (filters.maxAverageSpeed)
        queryFilter.averageSpeed.$lte = filters.maxAverageSpeed;
    }
    if (filters.minDurationMs || filters.maxDurationMs) {
      queryFilter.durationMs = {};
      if (filters.minDurationMs)
        queryFilter.durationMs.$gte = filters.minDurationMs;
      if (filters.maxDurationMs)
        queryFilter.durationMs.$lte = filters.maxDurationMs;
    }

    return this.signalModel.find(queryFilter).sort({ time: -1 }).exec();
  }

  async findOne(id: string): Promise<Signal> {
    const signal = await this.signalModel.findById(id).exec();
    if (!signal) {
      throw new NotFoundException(`Signal with ID "${id}" not found`);
    }
    return signal;
  }

  async update(id: string, updateSignalDto: UpdateSignalDto): Promise<Signal> {
    const existingSignal = await this.signalModel
      .findByIdAndUpdate(id, updateSignalDto, { new: true })
      .exec();

    if (!existingSignal) {
      throw new NotFoundException(`Signal with ID "${id}" not found`);
    }
    return existingSignal;
  }

  async remove(id: string): Promise<Signal> {
    const deletedSignal = await this.signalModel.findByIdAndDelete(id).exec();
    if (!deletedSignal) {
      throw new NotFoundException(`Signal with ID "${id}" not found`);
    }
    return deletedSignal;
  }
}
