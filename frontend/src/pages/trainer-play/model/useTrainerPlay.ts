import { useToast } from 'primevue/usetoast'
import { computed, type ComputedRef, ref, type Ref } from 'vue'

import {
  type LevelChange,
  trainerApi,
  type TrainerDef,
  type TrainerOutcome,
  useTrainerLevels,
} from '@/entities/trainer'

export type PlayPhase = 'playing' | 'finished'

export interface LevelMessage {
  severity: 'success' | 'warn' | 'secondary'
  text: string
}

interface TrainerPlay {
  playedLevel: Ref<number>
  phase: Ref<PlayPhase>
  attempt: Ref<number>
  lastOutcome: Ref<TrainerOutcome | null>
  levelMessage: ComputedRef<LevelMessage>
  accuracyLabel: ComputedRef<number>
  durationLabel: ComputedRef<string>
  onComplete: (outcome: TrainerOutcome) => void
  restart: () => void
}

/** Состояние сессии тренажёра: уровень, попытки, итог и сохранение результата. */
export function useTrainerPlay(trainerId: string, def: TrainerDef | undefined): TrainerPlay {
  const toast = useToast()
  const levels = useTrainerLevels()

  const playedLevel = ref<number>(levels.levelOf(trainerId))
  const phase = ref<PlayPhase>('playing')
  const attempt = ref<number>(0)
  const lastOutcome = ref<TrainerOutcome | null>(null)
  const newLevel = ref<number>(playedLevel.value)
  const levelChange = ref<LevelChange>('same')

  const levelMessage = computed<LevelMessage>(() => {
    if (levelChange.value === 'up') {
      return { severity: 'success', text: `Уровень повышен до ${newLevel.value}!` }
    }
    if (levelChange.value === 'down') {
      return { severity: 'warn', text: `Уровень понижен до ${newLevel.value}` }
    }
    return { severity: 'secondary', text: `Уровень ${newLevel.value}` }
  })

  const accuracyLabel = computed<number>(() => {
    if (lastOutcome.value === null) {
      return 0
    }
    return Math.round(lastOutcome.value.accuracy)
  })

  const durationLabel = computed<string>(() => {
    if (lastOutcome.value === null) {
      return '0.0'
    }
    return (lastOutcome.value.durationMs / 1000).toFixed(1)
  })

  function onComplete(outcome: TrainerOutcome): void {
    if (def === undefined) {
      return
    }
    lastOutcome.value = outcome
    phase.value = 'finished'
    const { level, change } = levels.applyOutcome(trainerId, outcome.accuracy)
    newLevel.value = level
    levelChange.value = change
    void trainerApi
      .saveResult({ trainerId, skill: def.skill, level: playedLevel.value, ...outcome })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось сохранить результат',
          life: 4000,
        })
      })
  }

  function restart(): void {
    playedLevel.value = levels.levelOf(trainerId)
    attempt.value += 1
    phase.value = 'playing'
  }

  return {
    playedLevel,
    phase,
    attempt,
    lastOutcome,
    levelMessage,
    accuracyLabel,
    durationLabel,
    onComplete,
    restart,
  }
}
