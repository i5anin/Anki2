import type { Card } from '../domain/card.entity'
import type { DeckCounts } from '../domain/deck.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import type { DeckConfig } from '../srs'

/** Начало сегодняшних суток (локальное время) в миллисекундах. */
function startOfDay(now: Date): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Сколько новых карточек и повторений уже сделано сегодня (для лимитов). */
function doneToday(logs: ReviewLog[], now: Date): { newDone: number; reviewsDone: number } {
  const start = startOfDay(now)
  let newDone = 0
  let reviewsDone = 0
  for (const log of logs) {
    if (new Date(log.reviewedAt).getTime() < start) continue
    if (log.stateBefore === 'new') newDone += 1
    else reviewsDone += 1
  }
  return { newDone, reviewsDone }
}

const byDue = (a: Card, b: Card): number => new Date(a.due).getTime() - new Date(b.due).getTime()
const byCreation = (a: Card, b: Card): number =>
  a.createdAt.localeCompare(b.createdAt) || a.templateIndex - b.templateIndex

/**
 * Отбирает карточки к показу прямо сейчас с учётом дневных лимитов.
 * Порядок: просроченное заучивание → повторения (due) → новые.
 */
export function selectQueue(
  cards: Card[],
  logsToday: ReviewLog[],
  config: DeckConfig,
  now: Date,
): Card[] {
  const nowMs = now.getTime()
  const active = cards.filter((c) => !c.isSuspended)
  const isDue = (c: Card): boolean => new Date(c.due).getTime() <= nowMs

  const learning = active
    .filter((c) => (c.state === 'learning' || c.state === 'relearning') && isDue(c))
    .sort(byDue)
  const reviews = active.filter((c) => c.state === 'review' && isDue(c)).sort(byDue)
  const news = active.filter((c) => c.state === 'new').sort(byCreation)

  const { newDone, reviewsDone } = doneToday(logsToday, now)
  const reviewLimit = Math.max(0, config.maxReviewsPerDay - reviewsDone)
  const newLimit = Math.max(0, config.newCardsPerDay - newDone)

  return [...learning, ...reviews.slice(0, reviewLimit), ...news.slice(0, newLimit)]
}

/** Считает агрегаты колоды для списка колод и шапки учебной сессии. */
export function countDeck(
  cards: Card[],
  logsToday: ReviewLog[],
  config: DeckConfig,
  now: Date,
): DeckCounts {
  const active = cards.filter((c) => !c.isSuspended)
  return {
    new: active.filter((c) => c.state === 'new').length,
    learning: active.filter((c) => c.state === 'learning' || c.state === 'relearning').length,
    review: active.filter((c) => c.state === 'review').length,
    due: selectQueue(cards, logsToday, config, now).length,
    total: cards.length,
  }
}
