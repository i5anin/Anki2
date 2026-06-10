import { BadRequestException, Controller, Get, Query } from '@nestjs/common'

import { StatsService } from './stats.service'
import type { DayCount, RetentionBreakdown, StatsOverview } from './stats.service'

/** Дефолтное окно для графиков (дни). */
const DEFAULT_DAYS = 30
const MAX_DAYS = 365

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('overview')
  overview(@Query('deckId') deckId?: string): Promise<StatsOverview> {
    return this.stats.overview(deckId)
  }

  @Get('forecast')
  forecast(@Query('deckId') deckId?: string, @Query('days') days?: string): Promise<DayCount[]> {
    return this.stats.forecast(deckId, this.parseDays(days))
  }

  @Get('retention')
  retention(@Query('deckId') deckId?: string): Promise<RetentionBreakdown> {
    return this.stats.retention(deckId)
  }

  @Get('reviews-by-day')
  reviewsByDay(
    @Query('deckId') deckId?: string,
    @Query('days') days?: string,
  ): Promise<DayCount[]> {
    return this.stats.reviewsByDay(deckId, this.parseDays(days))
  }

  /** Разбирает параметр days: положительное целое в пределах [1, MAX_DAYS]. */
  private parseDays(raw?: string): number {
    if (raw === undefined) return DEFAULT_DAYS
    const value = Number(raw)
    if (!Number.isInteger(value) || value < 1 || value > MAX_DAYS) {
      throw new BadRequestException(`Параметр days должен быть целым числом от 1 до ${MAX_DAYS}`)
    }
    return value
  }
}
