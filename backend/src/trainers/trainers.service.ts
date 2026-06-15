import { Injectable } from '@nestjs/common'

import type { TrainerResult } from '../domain/trainer-result.entity'
import type { CreateTrainerResultDto } from './dto/create-trainer-result.dto'

import { DataStore, type TrainerResultFilter } from '../store/data-store'

@Injectable()
export class TrainersService {
  constructor(private readonly store: DataStore) {}

  saveResult(dto: CreateTrainerResultDto): Promise<TrainerResult> {
    return this.store.createTrainerResult({
      trainerId: dto.trainerId,
      skill: dto.skill,
      level: dto.level,
      score: dto.score,
      accuracy: dto.accuracy,
      durationMs: dto.durationMs,
    })
  }

  listResults(filter: TrainerResultFilter): Promise<TrainerResult[]> {
    return this.store.listTrainerResults(filter)
  }
}
