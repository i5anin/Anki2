<script setup lang="ts">
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import { computed, onMounted, onUnmounted } from 'vue'

import type { RenderedCard } from '@/entities/card'
import { type IntervalPreview, type Rating } from '@/entities/study'
import { MarkdownContent } from '@/shared/ui'

const props = defineProps<{
  card: RenderedCard
  revealed: boolean
  previews: IntervalPreview[]
  grading: boolean
}>()

const emit = defineEmits<{
  reveal: []
  grade: [rating: Rating]
}>()

interface GradeButton {
  rating: Rating
  label: string
  severity: 'danger' | 'secondary' | 'success' | 'info'
}

const gradeButtons: GradeButton[] = [
  { rating: 1, label: 'Снова', severity: 'danger' },
  { rating: 2, label: 'Трудно', severity: 'secondary' },
  { rating: 3, label: 'Хорошо', severity: 'success' },
  { rating: 4, label: 'Легко', severity: 'info' },
]

const previewByRating = computed(
  () => new Map(props.previews.map((preview) => [preview.rating, preview.label])),
)

function intervalLabel(rating: Rating): string {
  return previewByRating.value.get(rating) ?? ''
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.revealed) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      emit('reveal')
    }
    return
  }

  if (props.grading) return

  if (event.key === '1' || event.key === '2' || event.key === '3' || event.key === '4') {
    event.preventDefault()
    emit('grade', Number(event.key) as Rating)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="study-card">
    <div class="study-card__head">
      <span class="study-card__type">{{ card.noteTypeName }}</span>
      <div v-if="card.tags.length" class="study-card__tags">
        <Tag v-for="tag in card.tags" :key="tag" :value="tag" severity="secondary" />
      </div>
    </div>

    <div class="study-card__body">
      <MarkdownContent :source="card.frontMarkdown" />

      <template v-if="revealed">
        <Divider />
        <MarkdownContent :source="card.backMarkdown" />
      </template>
    </div>

    <div class="study-card__foot">
      <Button
        v-if="!revealed"
        class="study-card__reveal"
        label="Показать ответ"
        size="large"
        @click="emit('reveal')"
      />

      <div v-else class="study-card__grades">
        <Button
          v-for="grade in gradeButtons"
          :key="grade.rating"
          class="study-card__grade"
          :severity="grade.severity"
          :disabled="grading"
          @click="emit('grade', grade.rating)"
        >
          <span class="study-card__grade-label">{{ grade.label }}</span>
          <span v-if="intervalLabel(grade.rating)" class="study-card__grade-interval">
            {{ intervalLabel(grade.rating) }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.study-card {
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

.study-card__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.study-card__type {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.study-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-left: auto;
}

.study-card__body {
  display: flex;
  flex-direction: column;
}

.study-card__foot {
  display: flex;
  flex-direction: column;
}

.study-card__reveal {
  width: 100%;
}

.study-card__grades {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}

.study-card__grade {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.study-card__grade-label {
  font-weight: 600;
}

.study-card__grade-interval {
  font-size: 0.75rem;
  opacity: 0.85;
}

@media (max-width: 520px) {
  .study-card__grades {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
