import { computed, onMounted, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

import type { TrainerOutcome } from '@/entities/trainer'

import { createEvalRound, type EvalRound } from './expressions'

const BASE_ROUNDS = 6
const LEVEL_ROUNDS_CAP = 6
const LIMIT_BASE_MS = 12000
const LIMIT_STEP_MS = 500
const LIMIT_MIN_MS = 6000
const TICK_MS = 50
const FEEDBACK_MS = 600
const HIT_SCORE = 120
const HIT_BONUS_MAX = 60

export type MentalEvalPhase = 'play' | 'feedback'

interface MentalEvalApi {
  round: Ref<EvalRound>
  roundNo: Ref<number>
  totalRounds: number
  remainingPct: ComputedRef<number>
  score: Ref<number>
  phase: Ref<MentalEvalPhase>
  picked: Ref<string | null>
  pick: (option: string) => void
}

/** Логика «Ментального интерпретатора»: раунды, таймер, очки, итоговый emit. */
export function useMentalEval(
  level: number,
  onComplete: (outcome: TrainerOutcome) => void,
): MentalEvalApi {
  const totalRounds = BASE_ROUNDS + Math.min(level, LEVEL_ROUNDS_CAP)
  const limitMs = Math.max(LIMIT_MIN_MS, LIMIT_BASE_MS - level * LIMIT_STEP_MS)

  const round = ref<EvalRound>(createEvalRound(level))
  const roundNo = ref<number>(1)
  const score = ref<number>(0)
  const phase = ref<MentalEvalPhase>('play')
  const picked = ref<string | null>(null)
  const remainingMs = ref<number>(limitMs)

  let correct = 0
  let startedAt = 0
  let roundStartedAt = 0
  let finished = false
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null

  const remainingPct = computed<number>(() =>
    Math.max(0, Math.min(100, (remainingMs.value / limitMs) * 100)),
  )

  function stopTick(): void {
    if (tickTimer !== null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  function finish(): void {
    if (finished) {
      return
    }
    finished = true
    onComplete({
      score: score.value,
      accuracy: Math.round((correct / totalRounds) * 100),
      durationMs: Math.round(performance.now() - startedAt),
    })
  }

  function startRound(): void {
    roundStartedAt = performance.now()
    remainingMs.value = limitMs
    const t: ReturnType<typeof setInterval> = setInterval(() => {
      const left = limitMs - (performance.now() - roundStartedAt)
      if (left <= 0) {
        stopTick()
        remainingMs.value = 0
        showFeedback(null)
      } else {
        remainingMs.value = left
      }
    }, TICK_MS)
    tickTimer = t
  }

  function nextRound(): void {
    if (roundNo.value >= totalRounds) {
      finish()
      return
    }
    roundNo.value += 1
    round.value = createEvalRound(level)
    phase.value = 'play'
    startRound()
  }

  function showFeedback(option: string | null): void {
    phase.value = 'feedback'
    picked.value = option
    const t: ReturnType<typeof setTimeout> = setTimeout(() => {
      feedbackTimer = null
      picked.value = null
      nextRound()
    }, FEEDBACK_MS)
    feedbackTimer = t
  }

  function pick(option: string): void {
    if (phase.value !== 'play' || finished) {
      return
    }
    stopTick()
    const left = Math.max(0, limitMs - (performance.now() - roundStartedAt))
    remainingMs.value = left
    if (option === round.value.answer) {
      correct += 1
      score.value += HIT_SCORE + Math.round((left / limitMs) * HIT_BONUS_MAX)
    }
    showFeedback(option)
  }

  onMounted(() => {
    startedAt = performance.now()
    startRound()
  })

  onUnmounted(() => {
    stopTick()
    if (feedbackTimer !== null) {
      clearTimeout(feedbackTimer)
      feedbackTimer = null
    }
  })

  return { round, roundNo, totalRounds, remainingPct, score, phase, picked, pick }
}
