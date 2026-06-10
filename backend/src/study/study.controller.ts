import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { StudyService } from './study.service'
import { ReviewDto } from './dto/review.dto'

@Controller('study')
export class StudyController {
  constructor(private readonly study: StudyService) {}

  @Get(':deckId/queue')
  queue(@Param('deckId') deckId: string) {
    return this.study.queue(deckId)
  }

  @Get(':deckId/preview/:cardId')
  preview(@Param('deckId') deckId: string, @Param('cardId') cardId: string) {
    return this.study.preview(deckId, cardId)
  }

  @Post('review')
  review(@Body() dto: ReviewDto) {
    return this.study.review(dto)
  }
}
