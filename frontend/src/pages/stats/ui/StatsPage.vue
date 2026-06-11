<script setup lang="ts">
import Select from 'primevue/select'
import { computed, onMounted, ref } from 'vue'

import { useDecksStore, type DeckWithCounts } from '@/entities/deck'
import { StatsDashboard } from '@/widgets/stats-dashboard'
import { StatsInsights } from '@/widgets/stats-insights'

interface DeckOption {
  label: string
  value: string | undefined
}

const decksStore = useDecksStore()

const selectedDeckId = ref<string | undefined>(undefined)

const deckOptions = computed<DeckOption[]>(() => [
  { label: 'Все колоды', value: undefined },
  ...decksStore.decks.map((deck: DeckWithCounts) => ({ label: deck.name, value: deck.id })),
])

onMounted(() => {
  if (decksStore.decks.length === 0) void decksStore.fetchAll()
})
</script>

<template>
  <div class="stats-page">
    <header class="stats-page__head">
      <h1 class="stats-page__title">Статистика</h1>
      <Select
        v-model="selectedDeckId"
        :options="deckOptions"
        option-label="label"
        option-value="value"
        placeholder="Все колоды"
        class="stats-page__deck"
      />
    </header>

    <StatsDashboard :deck-id="selectedDeckId" />

    <h2 class="stats-page__section">Аналитика</h2>
    <StatsInsights :deck-id="selectedDeckId" />
  </div>
</template>

<style scoped>
.stats-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.stats-page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.stats-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.stats-page__deck {
  min-width: 14rem;
}

.stats-page__section {
  margin: 0.5rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
}
</style>
