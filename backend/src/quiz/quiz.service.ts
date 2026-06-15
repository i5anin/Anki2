import { Injectable } from '@nestjs/common'

import type { QuizItem } from '../domain/quiz-item.entity'

import { DataStore } from '../store/data-store'

@Injectable()
export class QuizService {
  constructor(private readonly store: DataStore) {}

  list(category?: string): Promise<QuizItem[]> {
    const trimmed = category?.trim()
    return this.store.listQuizItems(
      trimmed !== undefined && trimmed.length > 0 ? { category: trimmed } : undefined,
    )
  }
}
