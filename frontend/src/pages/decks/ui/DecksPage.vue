<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { type DeckWithCounts, useDecksStore } from '@/entities/deck'
import { useDeleteDeck } from '@/features/delete-deck'
import { CreateDeckButton, DeckFormDialog, useManageDeck } from '@/features/manage-deck'
import { DecksGrid } from '@/widgets/decks-grid'

const store = useDecksStore()
const router = useRouter()
const { openEdit } = useManageDeck()
const { confirmDelete } = useDeleteDeck()

onMounted(() => {
  void store.fetchAll()
})

function onStudy(deckId: string): void {
  void router.push({ name: 'study', params: { deckId } })
}

function onQuiz(deckId: string): void {
  void router.push({ name: 'quiz', params: { deckId } })
}

function onBrowse(deckId: string): void {
  void router.push({ name: 'browse', params: { deckId } })
}

function onEdit(deck: DeckWithCounts): void {
  openEdit(deck)
}

function onDelete(deck: DeckWithCounts): void {
  confirmDelete(deck)
}
</script>

<template>
  <div class="decks-page">
    <header class="decks-page__head">
      <h1 class="decks-page__title">Колоды</h1>
      <CreateDeckButton />
    </header>

    <p class="decks-page__summary">
      Всего колод: <strong>{{ store.total }}</strong> · к повторению:
      <strong>{{ store.totalDue }}</strong>
    </p>

    <div v-if="store.isLoading && store.decks.length === 0" class="decks-page__skeletons">
      <Skeleton v-for="n in 4" :key="n" height="12rem" border-radius="0.75rem" />
    </div>

    <div v-else-if="store.decks.length === 0" class="decks-page__empty">
      <i class="pi pi-inbox" />
      <p>Нет колод — создайте первую</p>
    </div>

    <DecksGrid
      v-else
      :decks="store.decks"
      @study="onStudy"
      @quiz="onQuiz"
      @browse="onBrowse"
      @edit="onEdit"
      @delete="onDelete"
    />

    <DeckFormDialog />
  </div>
</template>

<style scoped>
.decks-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.decks-page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.decks-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.decks-page__summary {
  margin: 0;
  color: var(--app-muted);
}

.decks-page__skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}

.decks-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 1rem;
  color: var(--app-muted);
}

.decks-page__empty i {
  font-size: 2.5rem;
}
</style>
