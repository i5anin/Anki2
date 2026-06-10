<script setup lang="ts">
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { SKILL_LABELS, SKILL_SEVERITIES, TRAINERS, useTrainerLevels } from '@/entities/trainer'
import { TrainerProgress } from '@/widgets/trainer-progress'

import { useTrainersSummary } from '../model/useTrainersSummary'

const router = useRouter()
const { levelOf } = useTrainerLevels()
const { results, isLoading, error, summary, dailyTrainers, load, bestLabel, sessionsLabel } =
  useTrainersSummary()

onMounted(() => {
  void load()
})

function goToTrainer(trainerId: string): void {
  void router.push(`/trainers/${trainerId}`)
}
</script>

<template>
  <div class="trainers-page">
    <header class="trainers-page__head">
      <h1 class="trainers-page__title">Тренажёры</h1>
    </header>

    <Message v-if="error !== ''" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="isLoading" class="trainers-page__skeletons">
      <Skeleton v-for="n in 6" :key="n" height="11rem" border-radius="0.75rem" />
    </div>

    <template v-else>
      <div class="trainers-page__summary">
        <article v-for="chip in summary" :key="chip.key" class="trainers-page__chip">
          <i class="trainers-page__chip-icon" :class="chip.icon" />
          <span class="trainers-page__chip-value">{{ chip.value }}</span>
          <span class="trainers-page__chip-label">{{ chip.label }}</span>
        </article>
      </div>

      <section class="trainers-page__daily">
        <h2 class="trainers-page__subtitle">Тренировка дня</h2>
        <div class="trainers-page__daily-grid">
          <article
            v-for="trainer in dailyTrainers"
            :key="trainer.id"
            class="trainers-page__daily-card"
          >
            <span class="trainers-page__icon-box">
              <i :class="trainer.icon" />
            </span>
            <div class="trainers-page__daily-info">
              <span class="trainers-page__daily-name">{{ trainer.name }}</span>
              <Tag
                :value="SKILL_LABELS[trainer.skill]"
                :severity="SKILL_SEVERITIES[trainer.skill]"
              />
            </div>
            <Button
              label="Начать"
              icon="pi pi-play"
              size="small"
              @click="goToTrainer(trainer.id)"
            />
          </article>
        </div>
      </section>

      <section class="trainers-page__catalog">
        <h2 class="trainers-page__subtitle">Все тренажёры</h2>
        <div class="trainers-page__grid">
          <article v-for="trainer in TRAINERS" :key="trainer.id" class="trainers-page__card">
            <header class="trainers-page__card-head">
              <span class="trainers-page__icon-box">
                <i :class="trainer.icon" />
              </span>
              <h3 class="trainers-page__card-name">{{ trainer.name }}</h3>
              <Badge class="trainers-page__card-level" :value="`Ур. ${levelOf(trainer.id)}`" />
            </header>

            <p class="trainers-page__card-description">{{ trainer.description }}</p>

            <div class="trainers-page__card-meta">
              <Tag
                :value="SKILL_LABELS[trainer.skill]"
                :severity="SKILL_SEVERITIES[trainer.skill]"
              />
              <span class="trainers-page__card-stat">Лучший: {{ bestLabel(trainer.id) }}</span>
              <span class="trainers-page__card-stat">Сессий: {{ sessionsLabel(trainer.id) }}</span>
            </div>

            <Button label="Тренировать" icon="pi pi-play" fluid @click="goToTrainer(trainer.id)" />
          </article>
        </div>
      </section>

      <TrainerProgress v-if="results.length > 0" :results="results" />
    </template>
  </div>
</template>

<style scoped>
.trainers-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.trainers-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.trainers-page__subtitle {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.trainers-page__skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
}

.trainers-page__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.trainers-page__chip {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.trainers-page__chip-icon {
  font-size: 1.2rem;
  color: var(--p-primary-color);
}

.trainers-page__chip-value {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
}

.trainers-page__chip-label {
  font-size: 0.82rem;
  color: var(--app-muted);
}

.trainers-page__daily-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.trainers-page__daily-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.trainers-page__daily-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  margin-right: auto;
}

.trainers-page__daily-name {
  font-weight: 600;
}

.trainers-page__icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.6rem;
  background: var(--app-code-bg);
  color: var(--p-primary-color);
  font-size: 1.2rem;
}

.trainers-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}

.trainers-page__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.trainers-page__card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.trainers-page__card-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  word-break: break-word;
}

.trainers-page__card-level {
  flex-shrink: 0;
  margin-left: auto;
}

.trainers-page__card-description {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.trainers-page__card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: auto;
}

.trainers-page__card-stat {
  font-size: 0.85rem;
  color: var(--app-muted);
}

@media (max-width: 720px) {
  .trainers-page__summary,
  .trainers-page__daily-grid {
    grid-template-columns: 1fr;
  }
}
</style>
