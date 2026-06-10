import { useStorage } from '@vueuse/core'

const STORAGE_KEY = 'anki2:trainer-levels'

export const LEVEL_MIN = 1
export const LEVEL_MAX = 10

/** Порог точности для повышения уровня (как в адаптивных тренажёрах). */
const LEVEL_UP_ACCURACY = 85
/** Ниже этого порога уровень понижается. */
const LEVEL_DOWN_ACCURACY = 60

export type LevelChange = 'up' | 'down' | 'same'

// Уровни хранятся локально на устройстве — один общий стор на модуль.
const levels = useStorage<Record<string, number>>(STORAGE_KEY, {})

interface TrainerLevels {
  levelOf: (trainerId: string) => number
  /** Адаптация сложности по точности сессии; возвращает новый уровень. */
  applyOutcome: (trainerId: string, accuracy: number) => { level: number; change: LevelChange }
}

/** Адаптивные уровни сложности тренажёров (хранятся в localStorage). */
export function useTrainerLevels(): TrainerLevels {
  function levelOf(trainerId: string): number {
    return levels.value[trainerId] ?? LEVEL_MIN
  }

  function applyOutcome(
    trainerId: string,
    accuracy: number,
  ): { level: number; change: LevelChange } {
    const current = levelOf(trainerId)
    let next = current
    let change: LevelChange = 'same'
    if (accuracy >= LEVEL_UP_ACCURACY && current < LEVEL_MAX) {
      next = current + 1
      change = 'up'
    } else if (accuracy < LEVEL_DOWN_ACCURACY && current > LEVEL_MIN) {
      next = current - 1
      change = 'down'
    }
    levels.value = { ...levels.value, [trainerId]: next }
    return { level: next, change }
  }

  return { levelOf, applyOutcome }
}
