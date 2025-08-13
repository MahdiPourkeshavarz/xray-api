/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { SignalsService } from '../signals/signals.service';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly signalService: SignalsService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL config value is missing');
      }

      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      console.log('Connected to RabbitMQ');

      const queue = this.configService.get<string>('RABBITMQ_XRAY_QUEUE');
      if (!queue) {
        throw new Error('RABBITMQ_XRAY_QUEUE config value is missing');
      }

      await this.channel.assertQueue(queue, { durable: true });
      console.log(`Queue ${queue} is ready`);

      await this.channel.consume(queue, async (msg) => {
        try {
          const rawMessage = msg.content.toString();
          const dataVolume = msg.content.byteLength;
          const parsedData = JSON.parse(rawMessage);

          const deviceId = Object.keys(parsedData)[0];
          const signalData = parsedData[deviceId];
          const time = new Date(signalData.time);

          const dataPoints = Array.isArray(signalData.data)
            ? signalData.data
            : [];
          const dataLength = dataPoints.length;

          this.logger.log(`Processing signal from device: ${deviceId}`);

          let totalSpeed = 0;
          let maxSpeed = 0;
          const validRelativeTimes: number[] = [];
          let validPointsCount = 0;

          for (const point of dataPoints) {
            if (
              Array.isArray(point) &&
              point.length === 2 &&
              typeof point[0] === 'number' &&
              Array.isArray(point[1]) &&
              typeof point[1][2] === 'number'
            ) {
              const relativeTime = point[0];
              const speed = point[1][2];

              validRelativeTimes.push(relativeTime);
              totalSpeed += speed;
              validPointsCount++;

              if (speed > maxSpeed) {
                maxSpeed = speed;
              }
            } else {
              this.logger.warn(
                `Skipping malformed data point for device ${deviceId}: ${JSON.stringify(point)}`,
              );
            }
          }

          const durationMs =
            validRelativeTimes.length > 1
              ? Math.max(...validRelativeTimes) -
                Math.min(...validRelativeTimes)
              : 0;
          const averageSpeed =
            validPointsCount > 0 ? totalSpeed / validPointsCount : 0;

          console.log(`Signal processed for device ${deviceId}:
            time: ${time.toISOString()},
            dataLength: ${dataLength},
            dataVolume: ${dataVolume},
            averageSpeed: ${averageSpeed},
            durationMs: ${durationMs},
            maxSpeed: ${maxSpeed}`);

          await this.signalService.create({
            deviceId,
            time,
            dataLength,
            dataVolume,
            averageSpeed,
            durationMs,
            maxSpeed,
          });

          this.channel.ack(msg);
        } catch (error) {
          this.logger.error('Failed to process message', error);
          if (msg) {
            this.channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }
}
