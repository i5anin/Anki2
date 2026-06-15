import { computed, type ComputedRef, onMounted, onUnmounted, ref, type Ref } from 'vue'

import type { TrainerOutcome } from '@/entities/trainer'

import { createRound, type SpotBugRound } from './snippets'

const BASE_ROUNDS = 8
const LEVEL_ROUNDS_CAP = 7
const LIMIT_BASE_MS = 6000
const LIMIT_STEP_MS = 400
const LIMIT_MIN_MS = 2500
const TICK_MS = 50
const FEEDBACK_MS = 350
const HIT_SCORE = 100
const HIT_BONUS_MAX = 50

export type SpotBugPhase = 'play' | 'feedback'

interface SpotBugGame {
  round: Ref<SpotBugRound>
  roundNo: Ref<number>
  totalRounds: number
  remainingPct: ComputedRef<number>
  score: Ref<number>
  phase: Ref<SpotBugPhase>
  pickedIndex: Ref<number | null>
  pick: (index: number) => void
}

/** Логика тренажёра «Найди баг»: раунды, таймер, очки, итоговый emit. */
export function useSpotBug(
  level: number,
  onComplete: (outcome: TrainerOutcome) => void,
): SpotBugGame {
  const totalRounds = BASE_ROUNDS + Math.min(level, LEVEL_ROUNDS_CAP)
  const limitMs = Math.max(LIMIT_MIN_MS, LIMIT_BASE_MS - level * LIMIT_STEP_MS)

  const round = ref<SpotBugRound>(createRound())
  const roundNo = ref<number>(1)
  const score = ref<number>(0)
  const phase = ref<SpotBugPhase>('play')
  const pickedIndex = ref<number | null>(null)
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
    round.value = createRound()
    phase.value = 'play'
    startRound()
  }

  function showFeedback(picked: number | null): void {
    phase.value = 'feedback'
    pickedIndex.value = picked
    const t: ReturnType<typeof setTimeout> = setTimeout(() => {
      feedbackTimer = null
      pickedIndex.value = null
      nextRound()
    }, FEEDBACK_MS)
    feedbackTimer = t
  }

  function pick(index: number): void {
    if (phase.value !== 'play' || finished) {
      return
    }
    stopTick()
    const left = Math.max(0, limitMs - (performance.now() - roundStartedAt))
    remainingMs.value = left
    if (index === round.value.bugIndex) {
      correct += 1
      score.value += HIT_SCORE + Math.round((left / limitMs) * HIT_BONUS_MAX)
    }
    showFeedback(index)
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

  return { round, roundNo, totalRounds, remainingPct, score, phase, pickedIndex, pick }
}
