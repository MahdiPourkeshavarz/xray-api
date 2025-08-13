/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  create(@Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  findAll(
    @Query('deviceId') deviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAverageSpeed') minAverageSpeed?: number,
    @Query('maxAverageSpeed') maxAverageSpeed?: number,
    @Query('minDurationMs') minDurationMs?: number,
    @Query('maxDurationMs') maxDurationMs?: number,
  ) {
    return this.signalsService.findAll({
      deviceId,
      startDate,
      endDate,
      minAverageSpeed,
      maxAverageSpeed,
      minDurationMs,
      maxDurationMs,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSignalDto: UpdateSignalDto) {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.signalsService.remove(id);
  }
}
