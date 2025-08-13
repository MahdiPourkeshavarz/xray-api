/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {}

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

      await this.channel.consume(queue, (msg) => {
        if (msg !== null) {
          console.log(`Received message: ${msg.content.toString()}`);
          this.channel.ack(msg);
        } else {
          console.warn('Received null message');
        }
      });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }
}
