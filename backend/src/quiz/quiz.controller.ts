import { Controller, Get, Query } from '@nestjs/common'

import type { QuizItem } from '../domain/quiz-item.entity'

import { QuizService } from './quiz.service'

@Controller('quiz')
export class QuizController {
  constructor(private readonly quiz: QuizService) {}

  @Get('questions')
  list(@Query('category') category?: string): Promise<QuizItem[]> {
    return this.quiz.list(category)
  }
}
