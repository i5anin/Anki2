import type { ScheduleContext, SchedulingState } from './types'

import { DEFAULT_DECK_CONFIG } from './config'
import { previewIntervals, schedule } from './scheduler'

const NOW = new Date('2026-01-01T00:00:00.000Z')
const ctx: ScheduleContext = { now: NOW, config: DEFAULT_DECK_CONFIG }

const MIN = 60_000
const DAY = 86_400_000

function makeCard(overrides: Partial<SchedulingState> = {}): SchedulingState {
  return {
    state: 'new',
    due: NOW,
    intervalDays: 0,
    easeFactor: 2.5,
    reps: 0,
    lapses: 0,
    learningStep: 0,
    lastReviewedAt: null,
    ...overrides,
  }
}

describe('schedule — новые карточки и заучивание', () => {
  it('new + Good → learning, шаг 1, due через 10 минут', () => {
    const { next } = schedule(makeCard(), 3, ctx)
    expect(next.state).toBe('learning')
    expect(next.learningStep).toBe(1)
    expect(next.due.getTime()).toBe(NOW.getTime() + 10 * MIN)
    expect(next.reps).toBe(1)
    expect(next.lastReviewedAt).toEqual(NOW)
  })

  it('new + Again → learning, шаг 0, due через 1 минуту', () => {
    const { next } = schedule(makeCard(), 1, ctx)
    expect(next.state).toBe('learning')
    expect(next.learningStep).toBe(0)
    expect(next.due.getTime()).toBe(NOW.getTime() + 1 * MIN)
  })

  it('два Good подряд → выпуск в review с интервалом 1 день', () => {
    const first = schedule(makeCard(), 3, ctx).next
    const second = schedule(first, 3, { ...ctx, now: first.due }).next
    expect(second.state).toBe('review')
    expect(second.intervalDays).toBe(1)
    expect(second.due.getTime()).toBe(first.due.getTime() + 1 * DAY)
  })

  it('new + Easy → review с интервалом 4 дня', () => {
    const { next } = schedule(makeCard(), 4, ctx)
    expect(next.state).toBe('review')
    expect(next.intervalDays).toBe(4)
    expect(next.due.getTime()).toBe(NOW.getTime() + 4 * DAY)
  })
})

describe('schedule — review (SM-2)', () => {
  const reviewCard = makeCard({
    state: 'review',
    intervalDays: 10,
    due: NOW,
    lastReviewedAt: new Date(NOW.getTime() - 10 * DAY),
  })

  it('Good умножает интервал на ease', () => {
    const { next } = schedule(reviewCard, 3, ctx)
    expect(next.intervalDays).toBe(25) // 10 * 2.5
    expect(next.easeFactor).toBeCloseTo(2.5)
  })

  it('Easy повышает ease и применяет easyBonus', () => {
    const { next } = schedule(reviewCard, 4, ctx)
    expect(next.easeFactor).toBeCloseTo(2.65)
    // (10 + 0) * 2.65 * 1.3 ≈ 34.45 → 34
    expect(next.intervalDays).toBe(34)
  })

  it('Hard понижает ease и растит интервал умеренно', () => {
    const { next } = schedule(reviewCard, 2, ctx)
    expect(next.easeFactor).toBeCloseTo(2.35)
    expect(next.intervalDays).toBe(12) // round(10 * 1.2)
  })

  it('Again → relearning, ease −0.2, lapses +1', () => {
    const { next } = schedule(reviewCard, 1, ctx)
    expect(next.state).toBe('relearning')
    expect(next.easeFactor).toBeCloseTo(2.3)
    expect(next.lapses).toBe(1)
    expect(next.learningStep).toBe(0)
    expect(next.due.getTime()).toBe(NOW.getTime() + 10 * MIN) // relearningSteps[0]
  })

  it('ease не опускается ниже минимума 1.3', () => {
    const low = makeCard({ state: 'review', intervalDays: 5, easeFactor: 1.35 })
    const { next } = schedule(low, 2, ctx) // 1.35 - 0.15 = 1.2 → 1.3
    expect(next.easeFactor).toBeCloseTo(1.3)
  })
})

describe('schedule — выпуск из relearning', () => {
  it('relearning + Good восстанавливает review с сохранённым интервалом', () => {
    const relearn = makeCard({
      state: 'relearning',
      intervalDays: 1,
      learningStep: 0,
      lapses: 1,
      easeFactor: 2.3,
    })
    const { next } = schedule(relearn, 3, ctx)
    expect(next.state).toBe('review')
    expect(next.intervalDays).toBe(1)
    expect(next.due.getTime()).toBe(NOW.getTime() + 1 * DAY)
  })
})

describe('previewIntervals', () => {
  it('возвращает 4 метки для оценок Again/Hard/Good/Easy', () => {
    const previews = previewIntervals(makeCard(), ctx)
    expect(previews).toHaveLength(4)
    expect(previews.map((p) => p.rating)).toEqual([1, 2, 3, 4])
    for (const p of previews) {
      expect(typeof p.label).toBe('string')
      expect(p.label.length).toBeGreaterThan(0)
      expect(p.seconds).toBeGreaterThanOrEqual(0)
    }
  })

  it('Easy даёт интервал не меньше Good', () => {
    const review = makeCard({ state: 'review', intervalDays: 10, lastReviewedAt: NOW })
    const previews = previewIntervals(review, ctx)
    const good = previews.find((p) => p.rating === 3)!
    const easy = previews.find((p) => p.rating === 4)!
    expect(easy.seconds).toBeGreaterThanOrEqual(good.seconds)
  })
})
