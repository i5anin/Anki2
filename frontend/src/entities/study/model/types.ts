import type { Card, RenderedCard } from '@/entities/card'
import type { DeckCounts } from '@/entities/deck'

/** Оценка ответа: 1 Again, 2 Hard, 3 Good, 4 Easy. */
export type Rating = 1 | 2 | 3 | 4

/** Предпросмотр интервала для кнопки оценки. */
export interface IntervalPreview {
  rating: Rating
  seconds: number
  label: string
}

/** Учебная очередь колоды. */
export interface StudyQueue {
  deck: { id: string; name: string }
  counts: DeckCounts
  cards: RenderedCard[]
}

/** Результат применения оценки. */
export interface ReviewResult {
  card: Card
}
