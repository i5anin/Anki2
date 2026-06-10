<script setup lang="ts">
import { computed } from 'vue'

import type { QuizOption } from '@/entities/quiz'

const props = defineProps<{
  question: string
  options: QuizOption[]
  answered: boolean
  selectedIndex: number
  timeLeftMs: number
  perQuestionMs: number
}>()

const emit = defineEmits<{
  answer: [optionIndex: number]
}>()

const timePercent = computed(() =>
  Math.max(0, Math.min(100, Math.round((props.timeLeftMs / props.perQuestionMs) * 100))),
)

const timeLow = computed(() => props.timeLeftMs <= 5000)

function optionClass(option: QuizOption, optionIndex: number): string {
  if (!props.answered) {
    return ''
  }
  if (option.correct) {
    return 'quiz-question__option--correct'
  }
  if (optionIndex === props.selectedIndex) {
    return 'quiz-question__option--wrong'
  }
  return 'quiz-question__option--muted'
}

function onPick(optionIndex: number): void {
  if (!props.answered) {
    emit('answer', optionIndex)
  }
}
</script>

<template>
  <div class="quiz-question">
    <div class="quiz-question__timer">
      <div
        class="quiz-question__timer-bar"
        :class="{ 'quiz-question__timer-bar--low': timeLow }"
        :style="{ width: `${timePercent}%` }"
      />
    </div>

    <p class="quiz-question__text">{{ question }}</p>

    <div class="quiz-question__options">
      <button
        v-for="(option, optionIndex) in options"
        :key="optionIndex"
        type="button"
        class="quiz-question__option"
        :class="optionClass(option, optionIndex)"
        :disabled="answered"
        @click="onPick(optionIndex)"
      >
        {{ option.text }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-question {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 1.75rem;
  border: 1px solid var(--app-border);
  border-radius: 0.9rem;
  background: var(--app-surface);
  box-shadow: 0 10px 30px rgb(0 0 0 / 18%);
}

.quiz-question__timer {
  height: 0.4rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-muted) 22%, transparent);
  overflow: hidden;
}

.quiz-question__timer-bar {
  height: 100%;
  background: var(--p-primary-color, #6366f1);
  transition: width 0.1s linear;
}

.quiz-question__timer-bar--low {
  background: #ef4444;
}

.quiz-question__text {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
}

.quiz-question__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.quiz-question__option {
  padding: 0.9rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.7rem;
  background: var(--app-bg);
  color: var(--app-text);
  font: inherit;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;
}

.quiz-question__option:hover:not(:disabled) {
  border-color: var(--p-primary-color, #6366f1);
  transform: translateY(-1px);
}

.quiz-question__option:disabled {
  cursor: default;
}

.quiz-question__option--correct {
  border-color: #22c55e;
  background: color-mix(in srgb, #22c55e 22%, transparent);
}

.quiz-question__option--wrong {
  border-color: #ef4444;
  background: color-mix(in srgb, #ef4444 20%, transparent);
}

.quiz-question__option--muted {
  opacity: 0.55;
}

@media (max-width: 560px) {
  .quiz-question__options {
    grid-template-columns: 1fr;
  }
}
</style>
