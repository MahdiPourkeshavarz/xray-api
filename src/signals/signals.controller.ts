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
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('signals')
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new signal record' })
  @ApiResponse({
    status: 201,
    description: 'The signal has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all signals with advanced filtering' })
  @ApiResponse({
    status: 200,
    description: 'Return all signals matching the filters.',
  })
  @ApiQuery({ name: 'deviceId', required: false, type: String })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'ISO 8601 format (e.g., 2025-08-15)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'ISO 8601 format (e.g., 2025-08-16)',
  })
  @ApiQuery({ name: 'minAverageSpeed', required: false, type: Number })
  @ApiQuery({ name: 'maxAverageSpeed', required: false, type: Number })
  @ApiQuery({ name: 'minDurationMs', required: false, type: Number })
  @ApiQuery({ name: 'maxDurationMs', required: false, type: Number })
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
  @ApiOperation({ summary: 'Retrieve a single signal by its ID' })
  @ApiResponse({ status: 200, description: 'Return the signal.' })
  @ApiResponse({ status: 404, description: 'Signal not found.' })
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a signal's non-calculated metadata" })
  @ApiResponse({
    status: 200,
    description: 'The signal has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Signal not found.' })
  update(@Param('id') id: string, @Body() updateSignalDto: UpdateSignalDto) {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a signal' })
  @ApiResponse({
    status: 204,
    description: 'The signal has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Signal not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.signalsService.remove(id);
  }
}
