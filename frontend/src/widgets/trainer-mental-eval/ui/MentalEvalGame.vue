<script setup lang="ts">
import type { TrainerOutcome } from '@/entities/trainer'

import { useMentalEval } from '../model/useMentalEval'

const props = defineProps<{
  level: number
}>()

const emit = defineEmits<{
  complete: [outcome: TrainerOutcome]
}>()

const { round, roundNo, totalRounds, remainingPct, score, phase, picked, pick } = useMentalEval(
  props.level,
  (outcome: TrainerOutcome) => {
    emit('complete', outcome)
  },
)

function optionClass(option: string): Record<string, boolean> {
  const isFeedback = phase.value === 'feedback'
  const isAnswer = option === round.value.answer
  return {
    'mental-eval__option--correct': isFeedback && isAnswer,
    'mental-eval__option--wrong': isFeedback && !isAnswer && picked.value === option,
  }
}
</script>

<template>
  <div class="mental-eval">
    <div class="mental-eval__hud">
      <span class="mental-eval__hud-item">Раунд {{ roundNo }} из {{ totalRounds }}</span>
      <span class="mental-eval__hud-item">Счёт: {{ score }}</span>
      <span class="mental-eval__hud-item">Уровень: {{ level }}</span>
    </div>

    <div class="mental-eval__timer">
      <div class="mental-eval__timer-bar" :style="{ width: `${remainingPct}%` }"></div>
    </div>

    <p class="mental-eval__task">Что вернёт это выражение?</p>

    <pre class="mental-eval__code">{{ round.code }}</pre>

    <div class="mental-eval__options">
      <button
        v-for="option in round.options"
        :key="`${roundNo}-${option}`"
        type="button"
        class="mental-eval__option"
        :class="optionClass(option)"
        :disabled="phase === 'feedback'"
        @click="pick(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mental-eval {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 660px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.mental-eval__hud {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.mental-eval__hud-item {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--app-muted);
}

.mental-eval__timer {
  height: 6px;
  border-radius: 3px;
  background: var(--app-border);
  overflow: hidden;
}

.mental-eval__timer-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--p-primary-color);
  transition: width 60ms linear;
}

.mental-eval__task {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--app-muted);
}

.mental-eval__code {
  margin: 0;
  padding: 1.25rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--app-border);
  background: var(--app-code-bg);
  color: var(--app-text);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.35rem;
  line-height: 1.4;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
}

.mental-eval__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.mental-eval__option {
  padding: 0.9rem 0.75rem;
  border-radius: 0.75rem;
  border: 2px solid var(--app-border);
  background: var(--app-code-bg);
  color: var(--app-text);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.05rem;
  line-height: 1.4;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.mental-eval__option:hover:enabled {
  border-color: var(--p-primary-color);
}

.mental-eval__option:disabled {
  cursor: default;
}

.mental-eval__option--correct {
  border-color: var(--p-green-500, #22c55e);
  background: color-mix(in srgb, var(--p-green-500, #22c55e) 18%, var(--app-code-bg));
}

.mental-eval__option--wrong {
  border-color: var(--p-red-500, #ef4444);
  background: color-mix(in srgb, var(--p-red-500, #ef4444) 18%, var(--app-code-bg));
}

@media (max-width: 520px) {
  .mental-eval__code {
    font-size: 1.1rem;
  }

  .mental-eval__option {
    font-size: 0.9rem;
    padding: 0.75rem 0.6rem;
  }
}
</style>
