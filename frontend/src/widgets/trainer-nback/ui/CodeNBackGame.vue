<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'

import { type TrainerOutcome } from '@/entities/trainer'

import { useCodeNBack } from '../model/useCodeNBack'

const props = defineProps<{ level: number }>()

const emit = defineEmits<{ complete: [outcome: TrainerOutcome] }>()

const {
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
} = useCodeNBack(props.level, (outcome) => {
  emit('complete', outcome)
})

const stepsWord = nBack === 1 ? 'шаг' : 'шага'

const tokenModifier = computed(() => {
  if (feedback.value === 'hit') {
    return 'nback-game__token--hit'
  }
  if (feedback.value === 'wrong') {
    return 'nback-game__token--wrong'
  }
  return ''
})
</script>

<template>
  <div class="nback-game">
    <div class="nback-game__hud">
      <span class="nback-game__stat">Токен {{ index + 1 }}/{{ sequenceLength }}</span>
      <span class="nback-game__stat">N = {{ nBack }}</span>
      <span class="nback-game__stat">Уровень {{ level }}</span>
      <span class="nback-game__stat">Счёт {{ score }}</span>
      <span class="nback-game__stat">Попадания {{ hits }}</span>
      <span class="nback-game__stat">Ложные {{ falseAlarms }}</span>
      <span class="nback-game__stat">Пропуски {{ misses }}</span>
    </div>

    <div class="nback-game__stage">
      <div v-if="showing" class="nback-game__token" :class="tokenModifier">
        {{ currentToken }}
      </div>
      <div v-else class="nback-game__token nback-game__token--blank" />
    </div>

    <Button
      class="nback-game__match"
      label="Совпадает"
      size="large"
      :disabled="pressed"
      @click="press"
    />

    <p class="nback-game__hint">
      Жми «Совпадает» (или пробел), если токен повторяет показанный {{ nBack }}
      {{ stepsWord }} назад.
    </p>
  </div>
</template>

<style scoped>
.nback-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 660px;
  width: 100%;
  margin: 0 auto;
  padding: 1.75rem;
  border-radius: 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.nback-game__hud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1rem;
  font-size: 0.85rem;
  color: var(--app-muted);
}

.nback-game__stat {
  font-weight: 600;
}

.nback-game__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 9rem;
}

.nback-game__token {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 12rem;
  min-height: 7rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: 2px solid var(--app-border);
  background: var(--app-code-bg);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 2.75rem;
  font-weight: 600;
  color: var(--app-text);
  transition: border-color 0.15s ease;
}

.nback-game__token--hit {
  border-color: var(--p-primary-color);
}

.nback-game__token--wrong {
  border-color: var(--app-muted);
  animation: nback-shake 0.3s ease;
}

.nback-game__token--blank {
  opacity: 0;
}

.nback-game__match {
  min-width: 14rem;
}

.nback-game__hint {
  margin: 0;
  font-size: 0.85rem;
  text-align: center;
  color: var(--app-muted);
}

@keyframes nback-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}
</style>
