/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SignalDocument = HydratedDocument<Signal>;

@Schema({ timestamps: true })
export class Signal {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true, index: true })
  time: Date;

  @Prop({ required: true })
  dataLength: number;

  @Prop({ required: true })
  dataVolume: number;

  @Prop({ required: true, index: true })
  averageSpeed: number;

  @Prop({ required: true, index: true })
  durationMs: number;

  @Prop({ required: true, index: true })
  maxSpeed: number;
}

export const SignalSchema = SchemaFactory.createForClass(Signal);
SignalSchema.index({ deviceId: 1, time: -1 });
