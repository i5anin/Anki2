import { computed, type ComputedRef, onMounted, onUnmounted, type Ref, ref } from 'vue'

import { type TrainerOutcome } from '@/entities/trainer'

const TOKENS = [
  'const',
  'let',
  '=>',
  '===',
  '!==',
  'null',
  'undefined',
  '[]',
  '{}',
  'async',
  'await',
  '?.',
]
const GAP_MS = 350
const MATCH_RATE = 0.3

function pickN(level: number): number {
  if (level <= 2) {
    return 1
  }
  if (level <= 5) {
    return 2
  }
  return 3
}

function pickShowMs(level: number): number {
  if (level <= 3) {
    return 1600
  }
  return Math.max(1000, 1600 - (level - 3) * 100)
}

function randomToken(): string {
  return TOKENS[Math.floor(Math.random() * TOKENS.length)]
}

function randomTokenExcept(excluded: string): string {
  let token = randomToken()
  while (token === excluded) {
    token = randomToken()
  }
  return token
}

function buildSequence(length: number, n: number): string[] {
  const seq: string[] = []
  for (let i = 0; i < length; i += 1) {
    if (i < n) {
      seq.push(randomToken())
    } else if (Math.random() < MATCH_RATE) {
      seq.push(seq[i - n])
    } else {
      seq.push(randomTokenExcept(seq[i - n]))
    }
  }
  return seq
}

export interface CodeNBackGameState {
  nBack: number
  sequenceLength: number
  index: Ref<number>
  showing: Ref<boolean>
  pressed: Ref<boolean>
  feedback: Ref<'hit' | 'wrong' | null>
  hits: Ref<number>
  falseAlarms: Ref<number>
  misses: Ref<number>
  currentToken: ComputedRef<string>
  score: ComputedRef<number>
  press: () => void
}

/** Логика «Код N-назад»: последовательность, таймеры показа, учёт нажатий, итог. */
export function useCodeNBack(
  level: number,
  onComplete: (outcome: TrainerOutcome) => void,
): CodeNBackGameState {
  const nBack = pickN(level)
  const sequenceLength = 18 + level * 2
  const showMs = pickShowMs(level)
  const totalScored = sequenceLength - nBack
  const sequence = buildSequence(sequenceLength, nBack)

  const index = ref<number>(0)
  const showing = ref<boolean>(true)
  const pressed = ref<boolean>(false)
  const feedback = ref<'hit' | 'wrong' | null>(null)
  const hits = ref<number>(0)
  const falseAlarms = ref<number>(0)
  const misses = ref<number>(0)
  const correctRejections = ref<number>(0)
  const finished = ref<boolean>(false)

  let timer: ReturnType<typeof setTimeout> | undefined
  let startedAt = 0

  const currentToken = computed(() => sequence[index.value])

  const score = computed(() => Math.max(0, hits.value * 50 - falseAlarms.value * 25 + level * 20))

  function isMatchAt(position: number): boolean {
    return position >= nBack && sequence[position] === sequence[position - nBack]
  }

  function press(): void {
    if (finished.value || !showing.value || pressed.value) {
      return
    }
    pressed.value = true
    if (isMatchAt(index.value)) {
      hits.value += 1
      feedback.value = 'hit'
    } else {
      falseAlarms.value += 1
      feedback.value = 'wrong'
    }
  }

  function settle(): void {
    if (pressed.value || index.value < nBack) {
      return
    }
    if (isMatchAt(index.value)) {
      misses.value += 1
    } else {
      correctRejections.value += 1
    }
  }

  function finish(): void {
    finished.value = true
    const accuracy = Math.round(((hits.value + correctRejections.value) / totalScored) * 100)
    onComplete({
      score: score.value,
      accuracy,
      durationMs: Math.round(performance.now() - startedAt),
    })
  }

  function advance(): void {
    settle()
    if (index.value + 1 >= sequenceLength) {
      finish()
      return
    }
    showing.value = false
    feedback.value = null
    timer = setTimeout(() => {
      index.value += 1
      pressed.value = false
      showing.value = true
      timer = setTimeout(advance, showMs)
    }, GAP_MS)
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault()
      press()
    }
  }

  onMounted(() => {
    startedAt = performance.now()
    window.addEventListener('keydown', onKeydown)
    timer = setTimeout(advance, showMs)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    if (timer !== undefined) {
      clearTimeout(timer)
    }
  })

  return {
    nBack,
    sequenceLength,
    index,
    showing,
    pressed,
    feedback,
    hits,
    falseAlarms,
    misses,
    currentToken,
    score,
    press,
  }
}
