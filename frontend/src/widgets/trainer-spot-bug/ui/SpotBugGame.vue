<script setup lang="ts">
import type { TrainerOutcome } from '@/entities/trainer'

import { useSpotBug } from '../model/useSpotBug'

const props = defineProps<{
  level: number
}>()

const emit = defineEmits<{
  complete: [outcome: TrainerOutcome]
}>()

const { round, roundNo, totalRounds, remainingPct, score, phase, pickedIndex, pick } = useSpotBug(
  props.level,
  (outcome: TrainerOutcome) => {
    emit('complete', outcome)
  },
)

function lineClass(index: number): Record<string, boolean> {
  const isFeedback = phase.value === 'feedback'
  const isBug = index === round.value.bugIndex
  return {
    'spot-bug__line--correct': isFeedback && isBug,
    'spot-bug__line--wrong': isFeedback && !isBug && pickedIndex.value === index,
  }
}
</script>

<template>
  <div class="spot-bug">
    <div class="spot-bug__hud">
      <span class="spot-bug__hud-item">Раунд {{ roundNo }} из {{ totalRounds }}</span>
      <span class="spot-bug__hud-item">Счёт: {{ score }}</span>
      <span class="spot-bug__hud-item">Уровень: {{ level }}</span>
    </div>

    <div class="spot-bug__timer">
      <div class="spot-bug__timer-bar" :style="{ width: `${remainingPct}%` }"></div>
    </div>

    <p class="spot-bug__task">Кликни по строке с багом</p>

    <div class="spot-bug__lines">
      <button
        v-for="(line, index) in round.lines"
        :key="`${roundNo}-${index}`"
        type="button"
        class="spot-bug__line"
        :class="lineClass(index)"
        :disabled="phase === 'feedback'"
        @click="pick(index)"
      >
        {{ line }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.spot-bug {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.spot-bug__hud {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.spot-bug__hud-item {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--app-muted);
}

.spot-bug__timer {
  height: 6px;
  border-radius: 3px;
  background: var(--app-border);
  overflow: hidden;
}

.spot-bug__timer-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--p-primary-color);
  transition: width 60ms linear;
}

.spot-bug__task {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--app-muted);
}

.spot-bug__lines {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spot-bug__line {
  padding: 1.1rem 1.25rem;
  border-radius: 0.75rem;
  border: 2px solid var(--app-border);
  background: var(--app-code-bg);
  color: var(--app-text);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.05rem;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.spot-bug__line:hover:enabled {
  border-color: var(--p-primary-color);
  transform: translateY(-1px);
}

.spot-bug__line:disabled {
  cursor: default;
}

.spot-bug__line--correct {
  border-color: var(--p-green-500, #22c55e);
}

.spot-bug__line--wrong {
  border-color: var(--p-red-500, #ef4444);
}

@media (max-width: 520px) {
  .spot-bug__line {
    font-size: 0.9rem;
    padding: 0.85rem 1rem;
  }
}
</style>
