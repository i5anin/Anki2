<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import type { TrainerOutcome } from '@/entities/trainer'

const props = defineProps<{
  level: number
}>()

const emit = defineEmits<{
  complete: [outcome: TrainerOutcome]
}>()

type ValueFormat = 'decimal' | 'hex' | 'binary'

interface GridConfig {
  size: number
  format: ValueFormat
}

interface Cell {
  value: number
  done: boolean
  flashing: boolean
}

const ERROR_FLASH_MS = 300
const ERROR_PENALTY = 20
const MIN_SECONDS = 0.1

function getGridConfig(level: number): GridConfig {
  if (level <= 2) {
    return { size: 3, format: 'decimal' }
  }
  if (level <= 4) {
    return { size: 4, format: 'decimal' }
  }
  if (level <= 6) {
    return { size: 5, format: 'hex' }
  }
  return { size: 5, format: 'binary' }
}

function shuffledValues(count: number): number[] {
  const pool: number[] = []
  for (let value = 1; value <= count; value += 1) {
    pool.push(value)
  }
  const result: number[] = []
  while (pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(...pool.splice(index, 1))
  }
  return result
}

const config = getGridConfig(props.level)
const cellCount = config.size * config.size
const compactGrid = config.format === 'binary'
const gridStyle = { gridTemplateColumns: `repeat(${config.size}, 1fr)` }

const cells = ref<Cell[]>(
  shuffledValues(cellCount).map((value) => ({ value, done: false, flashing: false })),
)
const nextValue = ref<number>(1)
const errors = ref<number>(0)
const elapsedMs = ref<number>(0)
const finished = ref<boolean>(false)

const startedAt = performance.now()
let timer: ReturnType<typeof setInterval> | undefined
const flashTimeouts = new Set<ReturnType<typeof setTimeout>>()

function formatValue(value: number): string {
  if (config.format === 'hex') {
    return `0x${value.toString(16)}`
  }
  if (config.format === 'binary') {
    return `0b${value.toString(2)}`
  }
  return String(value)
}

const collected = computed(() => cells.value.filter((cell) => cell.done).length)
const nextLabel = computed(() => formatValue(nextValue.value))
const timerLabel = computed(() => (elapsedMs.value / 1000).toFixed(1))

function flashCell(cell: Cell): void {
  cell.flashing = true
  const t: ReturnType<typeof setTimeout> = setTimeout(() => {
    cell.flashing = false
    flashTimeouts.delete(t)
  }, ERROR_FLASH_MS)
  flashTimeouts.add(t)
}

function finish(): void {
  if (finished.value) {
    return
  }
  finished.value = true
  const durationMs = Math.round(performance.now() - startedAt)
  elapsedMs.value = durationMs
  const seconds = Math.max(durationMs / 1000, MIN_SECONDS)
  const score = Math.max(
    0,
    Math.round((cellCount * 1000) / seconds) - errors.value * ERROR_PENALTY,
  )
  const accuracy = Math.round((cellCount / (cellCount + errors.value)) * 100)
  emit('complete', { score, accuracy, durationMs })
}

function onCellClick(cell: Cell): void {
  if (finished.value || cell.done) {
    return
  }
  if (cell.value === nextValue.value) {
    cell.done = true
    if (cell.value === cellCount) {
      finish()
      return
    }
    nextValue.value += 1
    return
  }
  errors.value += 1
  flashCell(cell)
}

onMounted(() => {
  timer = setInterval(() => {
    if (!finished.value) {
      elapsedMs.value = performance.now() - startedAt
    }
  }, 100)
})

onUnmounted(() => {
  if (timer !== undefined) {
    clearInterval(timer)
  }
  for (const t of flashTimeouts) {
    clearTimeout(t)
  }
  flashTimeouts.clear()
})
</script>

<template>
  <div class="schulte-game">
    <div class="schulte-game__hud">
      <span class="schulte-game__stat">Уровень: {{ level }}</span>
      <span class="schulte-game__stat">Собрано: {{ collected }} из {{ cellCount }}</span>
      <span class="schulte-game__stat">
        Следующее:
        <span class="schulte-game__next">{{ nextLabel }}</span>
      </span>
      <span class="schulte-game__stat">{{ timerLabel }} с</span>
      <span class="schulte-game__stat">Ошибки: {{ errors }}</span>
    </div>

    <div
      class="schulte-game__grid"
      :class="{ 'schulte-game__grid--compact': compactGrid }"
      :style="gridStyle"
    >
      <button
        v-for="cell in cells"
        :key="cell.value"
        type="button"
        class="schulte-game__cell"
        :class="{
          'schulte-game__cell--done': cell.done,
          'schulte-game__cell--error': cell.flashing,
        }"
        @click="onCellClick(cell)"
      >
        {{ formatValue(cell.value) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.schulte-game {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.schulte-game__hud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.schulte-game__stat {
  font-size: 0.85rem;
  color: var(--app-muted);
}

.schulte-game__next {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  color: var(--p-primary-color);
}

.schulte-game__grid {
  display: grid;
  gap: 0.5rem;
}

.schulte-game__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  min-height: 3.5rem;
  padding: 0.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.6rem;
  background: var(--app-code-bg);
  color: var(--app-text);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition:
    opacity 0.25s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.schulte-game__cell:hover {
  border-color: var(--p-primary-color);
}

.schulte-game__grid--compact .schulte-game__cell {
  font-size: 0.85rem;
}

.schulte-game__cell--done {
  opacity: 0.15;
  pointer-events: none;
}

.schulte-game__cell--error {
  border-color: var(--p-red-500);
  background: color-mix(in srgb, var(--p-red-500) 25%, var(--app-code-bg));
  color: var(--p-red-500);
}

@media (max-width: 420px) {
  .schulte-game__cell {
    min-width: 3rem;
    min-height: 3rem;
    font-size: 1rem;
  }

  .schulte-game__grid--compact .schulte-game__cell {
    font-size: 0.75rem;
  }
}
</style>
