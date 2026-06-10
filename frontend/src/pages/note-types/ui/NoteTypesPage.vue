<script setup lang="ts">
import Chip from 'primevue/chip'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { onMounted } from 'vue'

import { useNoteTypesStore } from '@/entities/note-type'

const store = useNoteTypesStore()

onMounted(() => {
  void store.fetchAll()
})
</script>

<template>
  <main class="note-types-page">
    <header class="note-types-page__head">
      <h1 class="note-types-page__title">Модели заметок</h1>
      <p class="note-types-page__hint">
        Встроенные модели доступны только для просмотра и не редактируются.
      </p>
    </header>

    <div v-if="store.isLoading" class="note-types-page__grid">
      <Skeleton v-for="n in 3" :key="n" height="14rem" border-radius="0.75rem" />
    </div>

    <div v-else-if="store.noteTypes.length === 0" class="note-types-page__empty">
      <i class="pi pi-inbox" />
      <p>Модели заметок не найдены</p>
    </div>

    <div v-else class="note-types-page__grid">
      <article
        v-for="noteType in store.noteTypes"
        :key="noteType.id"
        class="note-type-card"
      >
        <header class="note-type-card__head">
          <h2 class="note-type-card__name">{{ noteType.name }}</h2>
          <div class="note-type-card__tags">
            <Tag v-if="noteType.isBuiltin" value="встроенная" severity="secondary" />
            <Tag v-if="noteType.isCloze" value="cloze" severity="info" />
          </div>
        </header>

        <section class="note-type-card__section">
          <span class="note-type-card__label">Поля</span>
          <div class="note-type-card__fields">
            <Chip v-for="field in noteType.fields" :key="field" :label="field" />
            <span v-if="noteType.fields.length === 0" class="note-type-card__muted">
              нет полей
            </span>
          </div>
        </section>

        <section class="note-type-card__section">
          <span class="note-type-card__label">Шаблоны</span>
          <div class="note-type-card__templates">
            <div
              v-for="(template, index) in noteType.templates"
              :key="index"
              class="note-type-template"
            >
              <span class="note-type-template__name">{{ template.name }}</span>
              <code class="note-type-template__code">{{ template.front }}</code>
              <code class="note-type-template__code">{{ template.back }}</code>
            </div>
            <span v-if="noteType.templates.length === 0" class="note-type-card__muted">
              нет шаблонов
            </span>
          </div>
        </section>
      </article>
    </div>
  </main>
</template>

<style scoped>
.note-types-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.note-types-page__head {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.note-types-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.note-types-page__hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--app-muted);
}

.note-types-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.25rem;
}

.note-types-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--app-muted);
}

.note-types-page__empty i {
  font-size: 2rem;
}

.note-type-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.note-type-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.note-type-card__name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.note-type-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.note-type-card__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-type-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--app-muted);
}

.note-type-card__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.note-type-card__muted {
  font-size: 0.85rem;
  color: var(--app-muted);
}

.note-type-card__templates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.note-type-template {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--app-border);
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--app-muted) 8%, transparent);
}

.note-type-template__name {
  font-size: 0.9rem;
  font-weight: 600;
}

.note-type-template__code {
  display: block;
  padding: 0.4rem 0.55rem;
  border-radius: 0.4rem;
  background: var(--app-code-bg, #1e1e2e);
  color: var(--p-text-color, #e2e8f0);
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
