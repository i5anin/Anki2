import type {
  CardState,
  DeckConfig,
  IntervalPreview,
  Rating,
  ReviewOutcome,
  ScheduleContext,
  SchedulingState,
} from './types'

import { formatInterval } from './format'

const MS_MIN = 60_000
const MS_DAY = 86_400_000

const addMinutes = (d: Date, m: number): Date => new Date(d.getTime() + m * MS_MIN)
const addDays = (d: Date, days: number): Date => new Date(d.getTime() + days * MS_DAY)
const daysBetween = (from: Date, to: Date): number => (to.getTime() - from.getTime()) / MS_DAY

/** Ограничивает интервал review границами [min, max] и округляет до дней. */
function clampInterval(intervalDays: number, config: DeckConfig): number {
  const rounded = Math.round(intervalDays)
  return Math.min(Math.max(rounded, config.minimumIntervalDays), config.maximumIntervalDays)
}

/** Гарантирует строгий рост интервала (для Good/Easy). */
function ensureGrowth(intervalDays: number, previous: number): number {
  return Math.max(intervalDays, Math.round(previous) + 1)
}

/** Первый шаг последовательности (с запасным значением 1 минута). */
function firstStep(steps: number[]): number {
  return steps.length > 0 ? steps[0] : 1
}

/** Планирование на шагах заучивания (learning) или переучивания (relearning). */
function scheduleLearning(
  state: SchedulingState,
  rating: Rating,
  config: DeckConfig,
  now: Date,
  kind: 'learning' | 'relearning',
): SchedulingState {
  const steps = kind === 'relearning' ? config.relearningSteps : config.learningSteps
  const base: SchedulingState = { ...state }

  // Новая карточка получает стартовый ease.
  if (state.state === 'new' || base.easeFactor < config.easeMinimum) {
    base.easeFactor = config.startingEase
  }

  const graduate = (intervalDays: number, easeBonus = 0): SchedulingState => {
    const ivl = clampInterval(intervalDays, config)
    return {
      ...base,
      state: 'review',
      learningStep: 0,
      intervalDays: ivl,
      easeFactor: base.easeFactor + easeBonus,
      due: addDays(now, ivl),
    }
  }

  // Again — на первый шаг.
  if (rating === 1) {
    return { ...base, state: kind, learningStep: 0, due: addMinutes(now, firstStep(steps)) }
  }

  // Hard — остаётся на текущем шаге.
  if (rating === 2) {
    const step = Math.min(Math.max(base.learningStep, 0), Math.max(steps.length - 1, 0))
    const minutes = steps[step] ?? firstStep(steps)
    return { ...base, state: kind, learningStep: step, due: addMinutes(now, minutes) }
  }

  // Good — следующий шаг или выпуск.
  if (rating === 3) {
    const nextStep = base.learningStep + 1
    if (nextStep >= steps.length) {
      return kind === 'relearning'
        ? graduate(Math.max(config.minimumIntervalDays, base.intervalDays))
        : graduate(config.graduatingIntervalDays)
    }
    return { ...base, state: kind, learningStep: nextStep, due: addMinutes(now, steps[nextStep]) }
  }

  // Easy — немедленный выпуск.
  return kind === 'relearning'
    ? graduate(Math.max(config.minimumIntervalDays, base.intervalDays), 0.15)
    : graduate(config.easyIntervalDays)
}

/** Планирование карточки в долгосрочном повторении (review, SM-2). */
function scheduleReview(
  state: SchedulingState,
  rating: Rating,
  config: DeckConfig,
  now: Date,
): SchedulingState {
  const base: SchedulingState = { ...state }
  const lateDays = Math.max(0, daysBetween(state.due, now))
  const prev = state.intervalDays

  // Again — провал, уход в переучивание.
  if (rating === 1) {
    const ease = Math.max(config.easeMinimum, base.easeFactor - 0.2)
    const postLapse = clampInterval(prev * config.lapseIntervalMultiplier, config)
    const steps = config.relearningSteps

    if (steps.length === 0) {
      return {
        ...base,
        state: 'review',
        easeFactor: ease,
        lapses: base.lapses + 1,
        learningStep: 0,
        intervalDays: postLapse,
        due: addDays(now, postLapse),
      }
    }
    return {
      ...base,
      state: 'relearning',
      easeFactor: ease,
      lapses: base.lapses + 1,
      learningStep: 0,
      intervalDays: postLapse, // сохраняем для выпуска из relearning
      due: addMinutes(now, steps[0]),
    }
  }

  // Hard.
  if (rating === 2) {
    const ease = Math.max(config.easeMinimum, base.easeFactor - 0.15)
    const ivl = clampInterval(prev * config.hardIntervalFactor * config.intervalModifier, config)
    return { ...base, state: 'review', easeFactor: ease, intervalDays: ivl, due: addDays(now, ivl) }
  }

  // Good.
  if (rating === 3) {
    const raw = (prev + lateDays / 2) * base.easeFactor * config.intervalModifier
    const ivl = clampInterval(ensureGrowth(raw, prev), config)
    return { ...base, state: 'review', intervalDays: ivl, due: addDays(now, ivl) }
  }

  // Easy.
  const ease = base.easeFactor + 0.15
  const raw = (prev + lateDays) * ease * config.easyBonus * config.intervalModifier
  const ivl = clampInterval(ensureGrowth(raw, prev), config)
  return { ...base, state: 'review', easeFactor: ease, intervalDays: ivl, due: addDays(now, ivl) }
}

/**
 * Главная функция планировщика: по текущему состоянию карточки и оценке
 * возвращает новое состояние и запись для журнала. Чистая и детерминированная.
 */
export function schedule(
  state: SchedulingState,
  rating: Rating,
  ctx: ScheduleContext,
): ReviewOutcome {
  const { now, config } = ctx
  const stateBefore: CardState = state.state
  const easeBefore = state.easeFactor
  const intervalBefore = state.intervalDays
  const elapsedDays = state.lastReviewedAt ? Math.max(0, daysBetween(state.lastReviewedAt, now)) : 0

  let next: SchedulingState
  switch (state.state) {
    case 'new':
    case 'learning': {
      next = scheduleLearning(state, rating, config, now, 'learning')
      break
    }
    case 'relearning': {
      next = scheduleLearning(state, rating, config, now, 'relearning')
      break
    }
    case 'review': {
      next = scheduleReview(state, rating, config, now)
      break
    }
    default: {
      throw new Error(`Неизвестное состояние карточки: ${String(state.state)}`)
    }
  }

  next.reps = state.reps + 1
  next.lastReviewedAt = now

  return {
    next,
    log: {
      stateBefore,
      stateAfter: next.state,
      intervalBefore,
      intervalAfter: next.intervalDays,
      easeBefore,
      easeAfter: next.easeFactor,
      elapsedDays,
    },
  }
}

/** Предпросмотр интервалов для всех четырёх кнопок оценки. */
export function previewIntervals(state: SchedulingState, ctx: ScheduleContext): IntervalPreview[] {
  const ratings: Rating[] = [1, 2, 3, 4]
  return ratings.map((rating) => {
    const { next } = schedule(state, rating, ctx)
    const seconds = Math.max(0, Math.round((next.due.getTime() - ctx.now.getTime()) / 1000))
    return { rating, seconds, label: formatInterval(seconds) }
  })
}
