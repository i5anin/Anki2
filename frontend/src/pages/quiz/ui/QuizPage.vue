<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useBlitzQuiz, useQuizSource } from '@/features/blitz-quiz'
import { getErrorMessage } from '@/shared/api'
import { QuizQuestion } from '@/widgets/quiz-question'

const router = useRouter()
const { title, studyTarget, load } = useQuizSource()

const isLoading = ref(true)
const error = ref<string | null>(null)
const noShort = ref(false)

const {
  phase,
  index,
  total,
  current,
  answered,
  selectedIndex,
  timeLeftMs,
  perQuestionMs,
  score,
  result,
  start,
  answer,
} = useBlitzQuiz()

async function begin(): Promise<void> {
  isLoading.value = true
  error.value = null
  noShort.value = false
  try {
    const questions = await load()
    if (questions.length === 0) {
      noShort.value = true
    } else {
      start(questions)
    }
  } catch (error_) {
    error.value = getErrorMessage(error_)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void begin()
})

function replay(): void {
  void begin()
}

function toStudy(): void {
  if (studyTarget.value !== null) {
    void router.push(studyTarget.value)
  }
}

function toHub(): void {
  void router.push('/quiz')
}

function toDecks(): void {
  void router.push('/')
}
</script>

<template>
  <div class="quiz-page">
    <header class="quiz-page__header">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="Назад"
        @click="toDecks"
      />
      <h1 class="quiz-page__title">Блиц · {{ title }}</h1>

      <div v-if="phase === 'playing'" class="quiz-page__hud">
        <span>Вопрос {{ index + 1 }} из {{ total }}</span>
        <strong>{{ score }}</strong>
      </div>
    </header>

    <div v-if="isLoading" class="quiz-page__center">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="noShort" class="quiz-page__center quiz-page__empty">
      <i class="pi pi-bolt" />
      <p>Недостаточно коротких вопросов для блица.</p>
      <Button v-if="studyTarget" label="К повторению" icon="pi pi-play" @click="toStudy" />
    </div>

    <div v-else-if="phase === 'playing' && current" class="quiz-page__center">
      <QuizQuestion
        :question="current.question"
        :options="current.options"
        :answered="answered"
        :selected-index="selectedIndex"
        :time-left-ms="timeLeftMs"
        :per-question-ms="perQuestionMs"
        @answer="answer"
      />
    </div>

    <div v-else-if="phase === 'finished'" class="quiz-page__center">
      <div class="quiz-page__result">
        <span class="quiz-page__result-eyebrow">Блиц завершён</span>
        <span class="quiz-page__result-score">{{ result.score }}</span>
        <span class="quiz-page__result-sub">очков</span>

        <div class="quiz-page__result-stats">
          <div>
            <span class="quiz-page__stat-value">{{ result.correct }}/{{ result.total }}</span>
            <span class="quiz-page__stat-label">верно</span>
          </div>
          <div>
            <span class="quiz-page__stat-value">{{ result.accuracy }}%</span>
            <span class="quiz-page__stat-label">точность</span>
          </div>
        </div>

        <p class="quiz-page__hint">Разминка окончена — теперь закрепи в повторении.</p>

        <div class="quiz-page__actions">
          <Button label="Ещё раз" icon="pi pi-refresh" @click="replay" />
          <Button
            v-if="studyTarget"
            label="К повторению"
            icon="pi pi-play"
            severity="secondary"
            @click="toStudy"
          />
          <Button
            label="К темам"
            icon="pi pi-th-large"
            severity="secondary"
            outlined
            @click="toHub"
          />
          <Button
            label="К колодам"
            icon="pi pi-clone"
            severity="secondary"
            text
            @click="toDecks"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.quiz-page__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quiz-page__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.quiz-page__hud {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  color: var(--app-muted);
}

.quiz-page__hud strong {
  color: var(--p-primary-color, #6366f1);
  font-size: 1.2rem;
}

.quiz-page__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
}

.quiz-page__empty {
  color: var(--app-muted);
  text-align: center;
}

.quiz-page__empty i {
  font-size: 2.5rem;
}

.quiz-page__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border: 1px solid var(--app-border);
  border-radius: 0.9rem;
  background: var(--app-surface);
  text-align: center;
}

.quiz-page__result-eyebrow {
  color: var(--app-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

.quiz-page__result-score {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--p-primary-color, #6366f1);
}

.quiz-page__result-sub {
  color: var(--app-muted);
}

.quiz-page__result-stats {
  display: flex;
  gap: 2.5rem;
  margin: 1rem 0;
}

.quiz-page__result-stats > div {
  display: flex;
  flex-direction: column;
}

.quiz-page__stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.quiz-page__stat-label {
  color: var(--app-muted);
  font-size: 0.82rem;
}

.quiz-page__hint {
  margin: 0 0 0.5rem;
  color: var(--app-muted);
}

.quiz-page__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
