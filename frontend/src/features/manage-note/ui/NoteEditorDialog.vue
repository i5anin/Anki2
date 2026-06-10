<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

import { MarkdownContent } from '@/shared/ui'

import { useNoteForm } from '../model/useNoteForm'

const {
  isOpen,
  title,
  form,
  errors,
  saving,
  fieldNames,
  previewSource,
  clozeHint,
  noteTypes,
  decks,
  onSave,
  close,
  onVisibilityChange,
} = useNoteForm()
</script>

<template>
  <Dialog
    :visible="isOpen"
    :header="title"
    modal
    :draggable="false"
    :style="{ width: '58rem' }"
    :breakpoints="{ '960px': '96vw' }"
    @update:visible="onVisibilityChange"
  >
    <div class="note-editor">
      <form class="note-editor__form" @submit.prevent="onSave">
        <div class="note-editor__row">
          <div class="note-editor__field">
            <label for="note-type">Модель<span class="note-editor__req">*</span></label>
            <Select
              id="note-type"
              v-model="form.noteTypeId"
              :options="noteTypes"
              option-label="name"
              option-value="id"
              placeholder="Выберите модель"
              :invalid="Boolean(errors.noteTypeId)"
              fluid
            />
            <small v-if="errors.noteTypeId" class="note-editor__error">{{
              errors.noteTypeId
            }}</small>
          </div>

          <div class="note-editor__field">
            <label for="note-deck">Колода<span class="note-editor__req">*</span></label>
            <Select
              id="note-deck"
              v-model="form.deckId"
              :options="decks"
              option-label="name"
              option-value="id"
              placeholder="Выберите колоду"
              :invalid="Boolean(errors.deckId)"
              fluid
            />
            <small v-if="errors.deckId" class="note-editor__error">{{ errors.deckId }}</small>
          </div>
        </div>

        <div v-for="name in fieldNames" :key="name" class="note-editor__field">
          <label :for="`field-${name}`">{{ name }}</label>
          <Textarea :id="`field-${name}`" v-model="form.fields[name]" auto-resize rows="3" fluid />
        </div>

        <small v-if="errors.fields" class="note-editor__error">{{ errors.fields }}</small>

        <div class="note-editor__field">
          <label for="note-tags">Теги</label>
          <InputText
            id="note-tags"
            v-model="form.tags"
            placeholder="через запятую"
            autocomplete="off"
            fluid
          />
        </div>

        <Message severity="secondary" :closable="false" class="note-editor__hint">
          Поддерживается Markdown, формулы <code>$...$</code> и пропуски <code>{{ clozeHint }}</code
          >.
        </Message>
      </form>

      <div class="note-editor__preview">
        <span class="note-editor__preview-title">Предпросмотр</span>
        <MarkdownContent v-if="previewSource" :source="previewSource" />
        <p v-else class="note-editor__preview-empty">Заполните поля, чтобы увидеть предпросмотр.</p>
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" severity="secondary" text @click="close" />
      <Button label="Сохранить" icon="pi pi-check" :loading="saving" @click="onSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.note-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  padding-top: 0.25rem;
}

.note-editor__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-editor__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.note-editor__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.note-editor__field label {
  font-size: 0.85rem;
  font-weight: 600;
}

.note-editor__req {
  color: var(--p-red-400, #f87171);
  margin-left: 0.15rem;
}

.note-editor__error {
  color: var(--p-red-400, #f87171);
  font-size: 0.8rem;
}

.note-editor__hint {
  margin-top: 0.25rem;
}

.note-editor__hint code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
}

.note-editor__preview {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--app-muted) 6%, transparent);
}

.note-editor__preview-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--app-muted);
}

.note-editor__preview-empty {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .note-editor {
    grid-template-columns: 1fr;
  }
}
</style>
