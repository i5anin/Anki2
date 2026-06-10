import type { DeckConfig } from './types'

/** Значения планировщика по умолчанию (близко к Anki). */
export const DEFAULT_DECK_CONFIG: DeckConfig = {
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  startingEase: 2.5,
  easyBonus: 1.3,
  hardIntervalFactor: 1.2,
  lapseIntervalMultiplier: 0.0,
  intervalModifier: 1.0,
  easeMinimum: 1.3,
  minimumIntervalDays: 1,
  maximumIntervalDays: 36500,
  newCardsPerDay: 20,
  maxReviewsPerDay: 200,
}

/** Накладывает частичную конфигурацию колоды поверх значений по умолчанию. */
export function mergeDeckConfig(partial?: Partial<DeckConfig> | null): DeckConfig {
  return { ...DEFAULT_DECK_CONFIG, ...(partial ?? {}) }
}
