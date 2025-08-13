/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';

const mockSignalsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SignalsController', () => {
  let controller: SignalsController;
  let service: SignalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignalsController],
      providers: [
        {
          provide: SignalsService,
          useValue: mockSignalsService,
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
    service = module.get<SignalsService>(SignalsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call signalsService.create with the correct data', () => {
      const createDto = new CreateSignalDto(); // You can populate this with test data
      controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should call signalsService.findAll with all provided query parameters', () => {
      const filters = {
        deviceId: 'device-1',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        minAverageSpeed: 2.0,
        maxAverageSpeed: 4.0,
        minDurationMs: 1000,
        maxDurationMs: 5000,
      };

      controller.findAll(
        filters.deviceId,
        filters.startDate,
        filters.endDate,
        filters.minAverageSpeed,
        filters.maxAverageSpeed,
        filters.minDurationMs,
        filters.maxDurationMs,
      );

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should call signalsService.findAll with an object of undefined values if no params are given', () => {
      controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith({
        deviceId: undefined,
        startDate: undefined,
        endDate: undefined,
        minAverageSpeed: undefined,
        maxAverageSpeed: undefined,
        minDurationMs: undefined,
        maxDurationMs: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should call signalsService.findOne with the correct id', () => {
      const id = 'some-mongo-id';
      controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call signalsService.update with the correct id and data', () => {
      const id = 'some-mongo-id';
      const updateDto = new UpdateSignalDto(); // Populate with test data
      controller.update(id, updateDto);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should call signalsService.remove with the correct id', () => {
      const id = 'some-mongo-id';
      controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
