<script setup lang="ts">
import Chart from 'primevue/chart'
import { computed } from 'vue'

import {
  SKILL_LABELS,
  type TrainerDef,
  type TrainerResult,
  TRAINERS,
  type TrainerSkill,
} from '@/entities/trainer'

const props = defineProps<{ results: TrainerResult[] }>()

const DATASET_COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#22c55e']

const CHART_OPTIONS = { responsive: true, maintainAspectRatio: false }

const SKILLS: TrainerSkill[] = ['attention', 'memory', 'speed', 'logic']

interface SkillStat {
  skill: TrainerSkill
  label: string
  accuracy: number
  sessions: number
}

interface DayBucket {
  sum: number
  count: number
}

/** Ключ локального дня (без времени) для группировки сессий. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Подпись дня для оси X в формате «дд.мм». */
function dayLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

/** Датасет линии тренажёра: точка — средний score за день. */
function buildDataset(trainer: TrainerDef, index: number, days: Date[]): Record<string, unknown> {
  const byDay = new Map<string, DayBucket>()
  for (const result of props.results) {
    if (result.trainerId !== trainer.id) {
      continue
    }
    const key = dayKey(new Date(result.playedAt))
    const bucket = byDay.get(key) ?? { sum: 0, count: 0 }
    bucket.sum += result.score
    bucket.count += 1
    byDay.set(key, bucket)
  }
  const color = DATASET_COLORS[index % DATASET_COLORS.length]
  return {
    label: trainer.name,
    data: days.map((date) => {
      const bucket = byDay.get(dayKey(date))
      return bucket === undefined ? null : Math.round(bucket.sum / bucket.count)
    }),
    borderColor: color,
    backgroundColor: color,
    tension: 0.35,
    spanGaps: true,
  }
}

const chartData = computed(() => {
  const days: Date[] = []
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    days.push(date)
  }
  return {
    labels: days.map((date) => dayLabel(date)),
    datasets: TRAINERS.map((trainer, index) => buildDataset(trainer, index, days)),
  }
})

const skillStats = computed<SkillStat[]>(() =>
  SKILLS.map((skill) => {
    const list = props.results.filter((result) => result.skill === skill)
    const accuracySum = list.reduce((sum, result) => sum + result.accuracy, 0)
    return {
      skill,
      label: SKILL_LABELS[skill],
      accuracy: list.length > 0 ? Math.round(accuracySum / list.length) : 0,
      sessions: list.length,
    }
  }),
)
</script>

<template>
  <section class="trainer-progress">
    <div class="trainer-progress__panel">
      <h2 class="trainer-progress__title">Счёт по дням</h2>
      <div class="trainer-progress__chart">
        <Chart type="line" :data="chartData" :options="CHART_OPTIONS" />
      </div>
    </div>

    <div class="trainer-progress__panel">
      <h2 class="trainer-progress__title">По навыкам</h2>
      <div class="trainer-progress__skills">
        <article v-for="stat in skillStats" :key="stat.skill" class="trainer-progress__skill">
          <span class="trainer-progress__skill-label">{{ stat.label }}</span>
          <span class="trainer-progress__skill-accuracy">{{ stat.accuracy }}%</span>
          <span class="trainer-progress__skill-caption">средняя точность</span>
          <span class="trainer-progress__skill-sessions">Сессий: {{ stat.sessions }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trainer-progress {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
}

.trainer-progress__panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.trainer-progress__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.trainer-progress__chart {
  height: 260px;
}

.trainer-progress__skills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.trainer-progress__skill {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem;
  border: 1px solid var(--app-border);
  border-radius: 0.6rem;
}

.trainer-progress__skill-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.trainer-progress__skill-accuracy {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.1;
}

.trainer-progress__skill-caption {
  font-size: 0.72rem;
  color: var(--app-muted);
}

.trainer-progress__skill-sessions {
  font-size: 0.8rem;
  color: var(--app-muted);
}

@media (max-width: 900px) {
  .trainer-progress {
    grid-template-columns: 1fr;
  }
}
</style>
