/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SignalsService } from './signals.service';
import { getModelToken } from '@nestjs/mongoose';
import { Signal } from './schema/signal.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateSignalDto } from './dto/create-signal.dto';

const mockSignal = {
  _id: '64d7b1a3e8c1d9b3e8f8d5a1',
  deviceId: 'test-device',
  time: new Date(),
  dataLength: 10,
  dataVolume: 1024,
  averageSpeed: 2.5,
  durationMs: 2000,
  maxSpeed: 5.0,
};

class MockSignalModel {
  constructor(public data: any) {}

  save() {
    return Promise.resolve(this.data);
  }

  static find = jest.fn().mockReturnThis();
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
  static findByIdAndDelete = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([mockSignal]);
}

describe('SignalsService', () => {
  let service: SignalsService;
  let model: Model<Signal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken(Signal.name),
          useValue: MockSignalModel, // Provide the mock class
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    model = module.get<Model<Signal>>(getModelToken(Signal.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new signal', async () => {
      const result = await service.create(mockSignal as CreateSignalDto);
      // The constructor is called, and the save method on the instance is called.
      expect(result).toEqual(mockSignal);
    });
  });

  describe('findAll', () => {
    it('should find all signals with given filters', async () => {
      const filters = { deviceId: 'test-device', minAverageSpeed: 2.0 };
      const expectedQuery = {
        deviceId: 'test-device',
        averageSpeed: { $gte: 2.0 },
      };

      // Mock the chainable methods on the static class
      (MockSignalModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockSignal]),
        }),
      });

      await service.findAll(filters);
      expect(MockSignalModel.find).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('findOne', () => {
    it('should find and return a signal by ID', async () => {
      (MockSignalModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSignal),
      });

      const result = await service.findOne('some-id');
      expect(MockSignalModel.findById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockSignal);
    });

    it('should throw NotFoundException if signal is not found', async () => {
      (MockSignalModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('some-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should find a signal by ID and update it', async () => {
      const updateDto = { dataLength: 20 };
      const updatedSignal = { ...mockSignal, ...updateDto };

      (MockSignalModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSignal),
      });

      const result = await service.update('some-id', updateDto);
      expect(MockSignalModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'some-id',
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedSignal);
    });

    it('should throw NotFoundException if signal to update is not found', async () => {
      (MockSignalModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('some-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should find a signal by ID and delete it', async () => {
      (MockSignalModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSignal),
      });

      const result = await service.remove('some-id');
      expect(MockSignalModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockSignal);
    });

    it('should throw NotFoundException if signal to delete is not found', async () => {
      (MockSignalModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('some-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
