import { computed, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

import type { QuizQuestion } from '@/entities/quiz'

const PER_QUESTION_MS = 20_000
const TICK_MS = 100
const FEEDBACK_MS = 850
const CORRECT_BASE = 100
const SPEED_BONUS = 50

export interface QuizResult {
  score: number
  correct: number
  total: number
  accuracy: number
}

interface BlitzQuiz {
  phase: Ref<'idle' | 'playing' | 'finished'>
  questions: Ref<QuizQuestion[]>
  index: Ref<number>
  current: ComputedRef<QuizQuestion | null>
  total: ComputedRef<number>
  score: Ref<number>
  correct: Ref<number>
  answered: Ref<boolean>
  selectedIndex: Ref<number>
  timeLeftMs: Ref<number>
  perQuestionMs: number
  result: ComputedRef<QuizResult>
  start: (items: QuizQuestion[]) => void
  answer: (optionIndex: number) => void
}

/** Стейт-машина блиц-викторины: таймер на вопрос, варианты, очки за скорость. */
export function useBlitzQuiz(): BlitzQuiz {
  const phase = ref<'idle' | 'playing' | 'finished'>('idle')
  const questions = ref<QuizQuestion[]>([])
  const index = ref(0)
  const score = ref(0)
  const correct = ref(0)
  const answered = ref(false)
  const selectedIndex = ref(-1)
  const timeLeftMs = ref(PER_QUESTION_MS)

  let ticker: ReturnType<typeof setInterval> | null = null
  let advanceTimer: ReturnType<typeof setTimeout> | null = null

  const current = computed<QuizQuestion | null>(() => questions.value[index.value] ?? null)
  const total = computed(() => questions.value.length)
  const result = computed<QuizResult>(() => ({
    score: score.value,
    correct: correct.value,
    total: total.value,
    accuracy: total.value > 0 ? Math.round((correct.value / total.value) * 100) : 0,
  }))

  function stopTicker(): void {
    if (ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }

  function startTicker(): void {
    stopTicker()
    timeLeftMs.value = PER_QUESTION_MS
    ticker = setInterval(() => {
      timeLeftMs.value -= TICK_MS
      if (timeLeftMs.value <= 0) {
        timeLeftMs.value = 0
        onTimeout()
      }
    }, TICK_MS)
  }

  function beginQuestion(): void {
    answered.value = false
    selectedIndex.value = -1
    startTicker()
  }

  function advance(): void {
    if (index.value + 1 >= total.value) {
      phase.value = 'finished'
      return
    }
    index.value += 1
    beginQuestion()
  }

  function scheduleAdvance(): void {
    advanceTimer = setTimeout(advance, FEEDBACK_MS)
  }

  function onTimeout(): void {
    if (answered.value) {
      return
    }
    stopTicker()
    answered.value = true
    selectedIndex.value = -1
    scheduleAdvance()
  }

  function answer(optionIndex: number): void {
    const question = current.value
    if (answered.value || question === null) {
      return
    }
    stopTicker()
    answered.value = true
    selectedIndex.value = optionIndex
    const chosen = question.options[optionIndex]
    if (chosen?.correct) {
      correct.value += 1
      score.value += CORRECT_BASE + Math.round((timeLeftMs.value / PER_QUESTION_MS) * SPEED_BONUS)
    }
    scheduleAdvance()
  }

  function start(items: QuizQuestion[]): void {
    questions.value = items
    index.value = 0
    score.value = 0
    correct.value = 0
    phase.value = 'playing'
    beginQuestion()
  }

  onUnmounted(() => {
    stopTicker()
    if (advanceTimer !== null) {
      clearTimeout(advanceTimer)
    }
  })

  return {
    phase,
    questions,
    index,
    current,
    total,
    score,
    correct,
    answered,
    selectedIndex,
    timeLeftMs,
    perQuestionMs: PER_QUESTION_MS,
    result,
    start,
    answer,
  }
}
