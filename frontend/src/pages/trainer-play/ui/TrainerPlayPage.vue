<script setup lang="ts">
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { onMounted, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { SKILL_LABELS, SKILL_SEVERITIES, TRAINERS } from '@/entities/trainer'
import { MentalEvalGame } from '@/widgets/trainer-mental-eval'
import { CodeNBackGame } from '@/widgets/trainer-nback'
import { SchulteGame } from '@/widgets/trainer-schulte'
import { SpotBugGame } from '@/widgets/trainer-spot-bug'

import { useTrainerPlay } from '../model/useTrainerPlay'

const GAME_COMPONENTS: Record<string, Component> = {
  schulte: SchulteGame,
  'code-nback': CodeNBackGame,
  'spot-bug': SpotBugGame,
  'mental-eval': MentalEvalGame,
}

const route = useRoute()
const router = useRouter()

const trainerId = String(route.params.trainerId)
const def = TRAINERS.find((trainer) => trainer.id === trainerId)
const gameComponent: Component | undefined = GAME_COMPONENTS[trainerId]

const {
  playedLevel,
  phase,
  attempt,
  lastOutcome,
  levelMessage,
  accuracyLabel,
  durationLabel,
  onComplete,
  restart,
} = useTrainerPlay(trainerId, def)

function goToTrainers(): void {
  void router.push('/trainers')
}

onMounted(() => {
  if (def === undefined) {
    void router.replace('/trainers')
  }
})
</script>

<template>
  <div class="trainer-play-page">
    <header class="trainer-play-page__header">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="К тренажёрам"
        @click="goToTrainers"
      />
      <h1 class="trainer-play-page__title">{{ def !== undefined ? def.name : 'Тренажёр' }}</h1>
      <Tag
        v-if="def !== undefined"
        :value="SKILL_LABELS[def.skill]"
        :severity="SKILL_SEVERITIES[def.skill]"
      />
      <Badge class="trainer-play-page__level" :value="`Уровень ${playedLevel}`" />
    </header>

    <main class="trainer-play-page__content">
      <component
        :is="gameComponent"
        v-if="def !== undefined && gameComponent !== undefined && phase === 'playing'"
        :key="attempt"
        :level="playedLevel"
        @complete="onComplete"
      />

      <div v-else-if="def !== undefined && lastOutcome !== null" class="trainer-play-page__result">
        <div class="trainer-play-page__result-head">
          <span class="trainer-play-page__result-caption">Результат</span>
          <Tag :value="SKILL_LABELS[def.skill]" :severity="SKILL_SEVERITIES[def.skill]" />
        </div>

        <div class="trainer-play-page__score">
          <span class="trainer-play-page__score-value">{{ lastOutcome.score }}</span>
          <span class="trainer-play-page__score-label">очков</span>
        </div>

        <ul class="trainer-play-page__stats">
          <li class="trainer-play-page__stat">
            <span class="trainer-play-page__stat-label">Точность</span>
            <span class="trainer-play-page__stat-value">{{ accuracyLabel }}%</span>
          </li>
          <li class="trainer-play-page__stat">
            <span class="trainer-play-page__stat-label">Время</span>
            <span class="trainer-play-page__stat-value">{{ durationLabel }} с</span>
          </li>
        </ul>

        <Message :severity="levelMessage.severity">{{ levelMessage.text }}</Message>

        <div class="trainer-play-page__actions">
          <Button label="Ещё раз" icon="pi pi-refresh" @click="restart" />
          <Button
            label="К тренажёрам"
            icon="pi pi-th-large"
            severity="secondary"
            @click="goToTrainers"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.trainer-play-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem;
}

.trainer-play-page__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trainer-play-page__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trainer-play-page__level {
  margin-left: auto;
  white-space: nowrap;
}

.trainer-play-page__content {
  display: flex;
  flex-direction: column;
}

.trainer-play-page__result {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 660px;
  width: 100%;
  margin: 0 auto;
  padding: 1.75rem;
  border-radius: 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: 0 12px 32px -16px rgb(0 0 0 / 40%);
}

.trainer-play-page__result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.trainer-play-page__result-caption {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.trainer-play-page__score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.trainer-play-page__score-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
}

.trainer-play-page__score-label {
  color: var(--app-muted);
  font-size: 0.9rem;
}

.trainer-play-page__stats {
  display: flex;
  justify-content: center;
  gap: 1rem 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.trainer-play-page__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 5rem;
}

.trainer-play-page__stat-label {
  color: var(--app-muted);
  font-size: 0.8rem;
}

.trainer-play-page__stat-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.trainer-play-page__actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}
</style>
