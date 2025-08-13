/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { SignalsService } from '../signals/signals.service';
import * as amqplib from 'amqplib';

// Mock the entire amqplib library
jest.mock('amqplib');

describe('RabbitmqService', () => {
  let service: RabbitmqService;
  let signalsService: SignalsService;

  // Create mock functions for the channel methods we use
  const mockChannel = {
    assertQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
  };

  // Create mock functions for the connection
  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RABBITMQ_URL') return 'amqp://localhost';
              if (key === 'RABBITMQ_XRAY_QUEUE') return 'test-queue';
              return null;
            }),
          },
        },
        {
          provide: SignalsService,
          useValue: {
            create: jest.fn().mockResolvedValue(true), // Mock the create method
          },
        },
      ],
    }).compile();

    service = module.get<RabbitmqService>(RabbitmqService);
    signalsService = module.get<SignalsService>(SignalsService);

    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to RabbitMQ and start a consumer', async () => {
      expect(amqplib.connect).toHaveBeenCalledWith('amqp://localhost');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('test-queue', {
        durable: true,
      });
      expect(mockChannel.consume).toHaveBeenCalledWith(
        'test-queue',
        expect.any(Function),
      );
    });
  });

  describe('Message Processing', () => {
    let consumeCallback: (msg: amqplib.Message | null) => void;

    beforeEach(() => {
      consumeCallback = mockChannel.consume.mock.calls[0][1];
    });

    it('should correctly process a valid message and call signalsService.create', async () => {
      const validPayload = {
        'device-123': {
          time: 1672531200000, // Jan 1, 2023
          data: [
            [100, [0, 0, 2.0]], // speed 2.0
            [600, [0, 0, 4.0]], // speed 4.0
          ],
        },
      };

      const message = {
        content: Buffer.from(JSON.stringify(validPayload)),
      } as amqplib.Message;

      await consumeCallback(message);

      expect(signalsService.create).toHaveBeenCalledWith({
        deviceId: 'device-123',
        time: new Date(1672531200000),
        dataLength: 2,
        dataVolume: Buffer.from(JSON.stringify(validPayload)).byteLength,
        averageSpeed: 3.0, // (2.0 + 4.0) / 2
        durationMs: 500, // 600 - 100
        maxSpeed: 4.0,
      });

      expect(mockChannel.ack).toHaveBeenCalledWith(message);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should nack a message with invalid JSON', async () => {
      const message = {
        content: Buffer.from('this is not json'),
      } as amqplib.Message;

      await consumeCallback(message);

      expect(signalsService.create).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    });

    it('should correctly calculate metrics as 0 for a message with no valid data points', async () => {
      const payloadWithEmptyData = {
        'device-456': {
          time: 1672531200000,
          data: [], // Empty data array
        },
      };
      const message = {
        content: Buffer.from(JSON.stringify(payloadWithEmptyData)),
      } as amqplib.Message;

      await consumeCallback(message);

      expect(signalsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          averageSpeed: 0,
          durationMs: 0,
          maxSpeed: 0,
        }),
      );
      expect(mockChannel.ack).toHaveBeenCalledWith(message);
    });

    it('should nack the message if signalsService.create throws an error', async () => {
      (signalsService.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      const validPayload = { 'device-789': { time: 1, data: [] } };
      const message = {
        content: Buffer.from(JSON.stringify(validPayload)),
      } as amqplib.Message;

      await consumeCallback(message);

      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    });
  });
});
