<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { QUIZ_CATEGORIES, quizApi, type QuizItem } from '@/entities/quiz'
import { getErrorMessage } from '@/shared/api'

interface HubCard {
  slug: string
  label: string
  icon: string
  count: number
}

const router = useRouter()
const items = ref<QuizItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const cards = computed<HubCard[]>(() => {
  const byCategory = new Map<string, number>()
  for (const item of items.value) {
    byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)
  }
  return QUIZ_CATEGORIES.map((category) => ({
    slug: category.slug,
    label: category.label,
    icon: category.icon,
    count: byCategory.get(category.slug) ?? 0,
  }))
})

const total = computed(() => items.value.length)

onMounted(async () => {
  try {
    items.value = await quizApi.getQuestions()
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    isLoading.value = false
  }
})

function play(category: string): void {
  void router.push({ name: 'quiz-topic', params: { category } })
}
</script>

<template>
  <div class="blitz-hub">
    <header class="blitz-hub__head">
      <h1 class="blitz-hub__title">Блиц</h1>
      <p class="blitz-hub__subtitle">
        Короткие вопросы с вариантами и таймером — разминка-узнавание перед глубоким повторением.
      </p>
    </header>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="isLoading" class="blitz-hub__grid">
      <Skeleton v-for="n in 6" :key="n" height="9rem" border-radius="0.75rem" />
    </div>

    <template v-else>
      <button type="button" class="blitz-hub__mixed" @click="play('all')">
        <span class="blitz-hub__mixed-icon"><i class="pi pi-bolt" /></span>
        <span class="blitz-hub__mixed-text">
          <span class="blitz-hub__mixed-title">Вперемешку</span>
          <span class="blitz-hub__mixed-sub">{{ total }} вопросов по всем темам</span>
        </span>
        <i class="pi pi-arrow-right" />
      </button>

      <div class="blitz-hub__grid">
        <article v-for="card in cards" :key="card.slug" class="blitz-hub__card">
          <span class="blitz-hub__card-icon"><i :class="card.icon" /></span>
          <h2 class="blitz-hub__card-title">{{ card.label }}</h2>
          <span class="blitz-hub__card-count">{{ card.count }} вопросов</span>
          <Button
            label="Начать"
            icon="pi pi-play"
            size="small"
            fluid
            :disabled="card.count === 0"
            @click="play(card.slug)"
          />
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.blitz-hub {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.blitz-hub__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.blitz-hub__subtitle {
  margin: 0.35rem 0 0;
  color: var(--app-muted);
}

.blitz-hub__mixed {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.85rem;
  background: var(--app-surface);
  color: var(--app-text);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;
}

.blitz-hub__mixed:hover {
  border-color: var(--p-primary-color, #6366f1);
}

.blitz-hub__mixed-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.7rem;
  background: var(--p-primary-color, #6366f1);
  color: #fff;
  font-size: 1.3rem;
}

.blitz-hub__mixed-text {
  display: flex;
  flex-direction: column;
}

.blitz-hub__mixed-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.blitz-hub__mixed-sub {
  color: var(--app-muted);
  font-size: 0.85rem;
}

.blitz-hub__mixed i.pi-arrow-right {
  margin-left: auto;
  color: var(--app-muted);
}

.blitz-hub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}

.blitz-hub__card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.blitz-hub__card-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--p-primary-color, #6366f1) 16%, transparent);
  color: var(--p-primary-color, #6366f1);
  font-size: 1.2rem;
}

.blitz-hub__card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.blitz-hub__card-count {
  color: var(--app-muted);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
</style>
