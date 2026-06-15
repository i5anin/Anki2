import { Body, Controller, Get, Post, Query } from '@nestjs/common'

import type { TrainerResult } from '../domain/trainer-result.entity'

import { CreateTrainerResultDto } from './dto/create-trainer-result.dto'
import { TrainersService } from './trainers.service'

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainers: TrainersService) {}

  @Get('results')
  list(
    @Query('trainerId') trainerId?: string,
    @Query('since') since?: string,
  ): Promise<TrainerResult[]> {
    return this.trainers.listResults({ trainerId, since })
  }

  @Post('results')
  create(@Body() dto: CreateTrainerResultDto): Promise<TrainerResult> {
    return this.trainers.saveResult(dto)
  }
}
