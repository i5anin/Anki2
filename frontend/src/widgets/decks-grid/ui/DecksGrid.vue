<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'

import { type DeckWithCounts } from '@/entities/deck'

defineProps<{ decks: DeckWithCounts[] }>()

const emit = defineEmits<{
  study: [deckId: string]
  browse: [deckId: string]
  edit: [deck: DeckWithCounts]
  delete: [deck: DeckWithCounts]
}>()
</script>

<template>
  <div class="decks-grid">
    <article v-for="deck in decks" :key="deck.id" class="decks-grid__card">
      <header class="decks-grid__head">
        <h2 class="decks-grid__name">{{ deck.name }}</h2>
        <div class="decks-grid__tools">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            rounded
            aria-label="Изменить"
            @click="emit('edit', deck)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Удалить"
            @click="emit('delete', deck)"
          />
        </div>
      </header>

      <p v-if="deck.description" class="decks-grid__description">{{ deck.description }}</p>

      <div class="decks-grid__counts">
        <Tag :value="`Новые ${deck.counts.new}`" severity="info" />
        <Tag :value="`Изучаются ${deck.counts.learning}`" severity="warn" />
        <Tag :value="`Повторение ${deck.counts.review}`" severity="success" />
        <Tag
          :value="`К показу ${deck.counts.due}`"
          :severity="deck.counts.due > 0 ? 'danger' : 'secondary'"
          class="decks-grid__due"
        />
      </div>

      <footer class="decks-grid__actions">
        <Button
          :label="deck.counts.due === 0 ? 'Готово на сегодня' : 'Учить'"
          icon="pi pi-play"
          :disabled="deck.counts.due === 0"
          fluid
          @click="emit('study', deck.id)"
        />
        <Button
          label="Карточки"
          icon="pi pi-list"
          severity="secondary"
          outlined
          fluid
          @click="emit('browse', deck.id)"
        />
      </footer>
    </article>
  </div>
</template>

<style scoped>
.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}

.decks-grid__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.decks-grid__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.decks-grid__name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  word-break: break-word;
}

.decks-grid__tools {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.decks-grid__description {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.decks-grid__counts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: auto;
}

.decks-grid__due {
  margin-left: auto;
}

.decks-grid__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
