<script setup lang="ts">
import Message from 'primevue/message'

import { StatChart } from '@/widgets/stat-chart'

import { useStatsInsights } from '../model/useStatsInsights'

const props = defineProps<{ deckId?: string }>()

const { ready, error, ease, interval, answers, hours, time, activity, decks, noLegend, bottomLegend, stacked } =
  useStatsInsights(() => props.deckId)
</script>

<template>
  <div class="stats-insights">
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="stats-insights__grid">
      <StatChart title="Распределение ease" type="bar" :data="ease" :ready="ready" :options="noLegend" />
      <StatChart
        title="Распределение интервалов"
        type="bar"
        :data="interval"
        :ready="ready"
        :options="noLegend"
      />
      <StatChart
        title="Кнопки ответов"
        type="doughnut"
        :data="answers"
        :ready="ready"
        :options="bottomLegend"
      />
      <StatChart
        title="Повторения по часам"
        type="bar"
        :data="hours"
        :ready="ready"
        :options="noLegend"
      />
      <StatChart
        title="Время на повторения по дням (мин)"
        type="line"
        :data="time"
        :ready="ready"
        :options="noLegend"
        wide
      />
      <StatChart
        title="Активность (90 дней)"
        type="bar"
        :data="activity"
        :ready="ready"
        :options="noLegend"
        wide
      />
      <StatChart
        title="Карточки по колодам"
        type="bar"
        :data="decks"
        :ready="ready"
        :options="stacked"
        wide
      />
    </div>
  </div>
</template>

<style scoped>
.stats-insights {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats-insights__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 720px) {
  .stats-insights__grid {
    grid-template-columns: 1fr;
  }
}
</style>
