/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { SignalsService } from 'src/signals/signals.service';

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
          const dataLength = signalData.data.length;

          this.logger.log(`Processing signal from device: ${deviceId}`);

          await this.signalService.create({
            deviceId,
            time,
            dataLength,
            dataVolume,
          });

          this.channel.ack(msg);
        } catch (error) {
          this.logger.error('Failed to process message', error);
          this.channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }
}
