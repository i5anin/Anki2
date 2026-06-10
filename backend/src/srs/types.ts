/** Состояние планирования карточки (см. docs/SRS.md). */
export type CardState = 'new' | 'learning' | 'review' | 'relearning'

/** Оценка ответа: 1 Again, 2 Hard, 3 Good, 4 Easy. */
export type Rating = 1 | 2 | 3 | 4

/** Конфигурация колоды — параметры планировщика. */
export interface DeckConfig {
  /** Шаги заучивания, минуты. */
  learningSteps: number[]
  /** Шаги переучивания после провала, минуты. */
  relearningSteps: number[]
  /** Интервал «выпуска» из learning по Good, дни. */
  graduatingIntervalDays: number
  /** Интервал «выпуска» по Easy, дни. */
  easyIntervalDays: number
  /** Стартовый ease-фактор. */
  startingEase: number
  /** Доп. множитель интервала для Easy. */
  easyBonus: number
  /** Множитель интервала для Hard. */
  hardIntervalFactor: number
  /** Доля старого интервала, сохраняемая после провала (0 → сброс к минимуму). */
  lapseIntervalMultiplier: number
  /** Глобальный модификатор интервала. */
  intervalModifier: number
  /** Нижняя граница ease-фактора. */
  easeMinimum: number
  /** Минимальный интервал review, дни. */
  minimumIntervalDays: number
  /** Максимальный интервал, дни. */
  maximumIntervalDays: number
  /** Лимит новых карточек в день. */
  newCardsPerDay: number
  /** Лимит повторений в день. */
  maxReviewsPerDay: number
}

/** Поля карточки, которыми оперирует планировщик. */
export interface SchedulingState {
  state: CardState
  /** Когда карточка снова к показу. */
  due: Date
  /** Текущий интервал (дни) — значим для review/relearning. */
  intervalDays: number
  /** Ease-фактор (коэффициент). */
  easeFactor: number
  /** Сколько раз карточку показывали. */
  reps: number
  /** Сколько раз забывали. */
  lapses: number
  /** Индекс текущего шага заучивания. */
  learningStep: number
  /** Когда отвечали в прошлый раз (null — ни разу). */
  lastReviewedAt: Date | null
}

/** Контекст планирования: «сейчас» и конфигурация колоды. */
export interface ScheduleContext {
  now: Date
  config: DeckConfig
}

/** Запись для журнала повторений. */
export interface ReviewLogEntry {
  stateBefore: CardState
  stateAfter: CardState
  intervalBefore: number
  intervalAfter: number
  easeBefore: number
  easeAfter: number
  elapsedDays: number
}

/** Результат планирования: новое состояние + данные для журнала. */
export interface ReviewOutcome {
  next: SchedulingState
  log: ReviewLogEntry
}

/** Предпросмотр интервала для одной кнопки оценки. */
export interface IntervalPreview {
  rating: Rating
  /** Через сколько секунд карточка снова к показу. */
  seconds: number
  /** Человекочитаемая метка («10 мин», «4 д», «2,3 мес»). */
  label: string
}
