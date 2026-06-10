<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useStudySession } from '@/features/study-session'
import { StudyCard } from '@/widgets/study-card'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// reactive() разворачивает ref'ы сессии на верхнем уровне — доступ как session.X.
const session = reactive(useStudySession())

function goToDecks(): void {
  void router.push('/')
}

async function startSession(): Promise<void> {
  const deckId = String(route.params.deckId)
  try {
    await session.start(deckId)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: session.error ?? 'Не удалось загрузить учебную сессию',
      life: 4000,
    })
  }
}

onMounted(() => {
  void startSession()
})
</script>

<template>
  <div class="study-page">
    <header class="study-page__header">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="К колодам"
        @click="goToDecks"
      />
      <h1 class="study-page__title">{{ session.deckName || 'Учебная сессия' }}</h1>
      <span class="study-page__remaining">осталось {{ session.remaining }}</span>
      <ProgressBar :value="session.progress" class="study-page__progress" />
    </header>

    <main class="study-page__content">
      <div v-if="session.isLoading" class="study-page__loading">
        <Skeleton height="2rem" width="40%" />
        <Skeleton height="12rem" />
        <Skeleton height="3rem" />
      </div>

      <StudyCard
        v-else-if="session.current"
        :card="session.current"
        :revealed="session.revealed"
        :previews="session.previews"
        :grading="session.isGrading"
        @reveal="session.reveal"
        @grade="session.grade"
      />

      <Card v-else class="study-page__finished">
        <template #title>Сессия завершена 🎉</template>
        <template #content>
          <ul class="study-page__stats">
            <li>
              <span class="study-page__stat-label">Повторено</span>
              <span class="study-page__stat-value">{{ session.stats.reviewed }}</span>
            </li>
            <li>
              <span class="study-page__stat-label">Снова</span>
              <span class="study-page__stat-value">{{ session.stats.again }}</span>
            </li>
            <li>
              <span class="study-page__stat-label">Трудно</span>
              <span class="study-page__stat-value">{{ session.stats.hard }}</span>
            </li>
            <li>
              <span class="study-page__stat-label">Хорошо</span>
              <span class="study-page__stat-value">{{ session.stats.good }}</span>
            </li>
            <li>
              <span class="study-page__stat-label">Легко</span>
              <span class="study-page__stat-value">{{ session.stats.easy }}</span>
            </li>
          </ul>
        </template>
        <template #footer>
          <div class="study-page__finished-actions">
            <Button label="К колодам" icon="pi pi-th-large" severity="secondary" @click="goToDecks" />
            <Button label="Повторить" icon="pi pi-refresh" @click="session.restart" />
          </div>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.study-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem;
}

.study-page__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem 1rem;
}

.study-page__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.study-page__remaining {
  color: var(--app-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

.study-page__progress {
  grid-column: 1 / -1;
  height: 0.5rem;
}

.study-page__content {
  display: flex;
  flex-direction: column;
}

.study-page__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.study-page__finished {
  text-align: center;
}

.study-page__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.study-page__stats li {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 4.5rem;
}

.study-page__stat-label {
  color: var(--app-muted);
  font-size: 0.8rem;
}

.study-page__stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.study-page__finished-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}
</style>
