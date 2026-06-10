<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'

import { useDecksStore } from '@/entities/deck'
import { useNotesStore, type NoteDraft } from '@/entities/note'
import { useNoteTypesStore } from '@/entities/note-type'
import { MarkdownContent } from '@/shared/ui'

import { useManageNote } from '../model/useManageNote'

const notesStore = useNotesStore()
const noteTypesStore = useNoteTypesStore()
const decksStore = useDecksStore()
const toast = useToast()
const { isOpen, editing, presetDeckId, close } = useManageNote()

const { noteTypes } = storeToRefs(noteTypesStore)
const { decks } = storeToRefs(decksStore)

interface NoteForm {
  noteTypeId: string
  deckId: string
  fields: Record<string, string>
  tags: string
}

const form = reactive<NoteForm>({ noteTypeId: '', deckId: '', fields: {}, tags: '' })
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const isEdit = computed(() => editing.value !== null)
const title = computed(() => (isEdit.value ? 'Редактирование заметки' : 'Новая заметка'))

// Шаблон cloze храним в строке — фигурные скобки ломают парсер шаблона Vue.
const clozeHint = '{{c1::...}}'

const currentNoteType = computed(
  () => noteTypes.value.find((type) => type.id === form.noteTypeId) ?? null,
)
const fieldNames = computed(() => currentNoteType.value?.fields ?? [])

// Пересборка значений полей по выбранной модели с сохранением совпадающих.
function rebuildFields(names: string[], source: Record<string, string> = form.fields): void {
  const next: Record<string, string> = {}
  for (const name of names) next[name] = source[name] ?? ''
  form.fields = next
}

watch(isOpen, async (open) => {
  if (!open) return
  errors.value = {}

  if (noteTypes.value.length === 0) await noteTypesStore.fetchAll()
  if (decks.value.length === 0) await decksStore.fetchAll()

  const source = editing.value
  if (source) {
    form.noteTypeId = source.noteTypeId
    form.deckId = source.deckId
    form.tags = source.tags.join(', ')
    const names = noteTypes.value.find((type) => type.id === source.noteTypeId)?.fields ?? []
    rebuildFields(names.length > 0 ? names : Object.keys(source.fields), source.fields)
  } else {
    form.noteTypeId = noteTypes.value[0]?.id ?? ''
    form.deckId = presetDeckId.value ?? decks.value[0]?.id ?? ''
    form.tags = ''
    rebuildFields(currentNoteType.value?.fields ?? [], {})
  }
})

// При смене модели — пересобрать поля, сохранив совпадающие значения.
watch(
  () => form.noteTypeId,
  (id, prev) => {
    if (id === prev) return
    rebuildFields(noteTypes.value.find((type) => type.id === id)?.fields ?? [])
  },
)

const previewSource = computed(() => {
  const names = fieldNames.value
  if (names.length === 0) {
    return ''
  }
  return names
    .map((name) => {
      const value = form.fields[name]?.trim() ?? ''
      return value !== '' ? `**${name}**\n\n${value}` : ''
    })
    .filter((chunk) => chunk !== '')
    .join('\n\n---\n\n')
})

function validate(): boolean {
  const map: Record<string, string> = {}
  if (form.noteTypeId === '') {
    map.noteTypeId = 'Выберите модель заметки'
  }
  if (form.deckId === '') {
    map.deckId = 'Выберите колоду'
  }

  const firstField = fieldNames.value[0]
  if (firstField !== undefined) {
    const value = form.fields[firstField]?.trim() ?? ''
    if (value === '') {
      map.fields = `Поле «${firstField}» не должно быть пустым`
    }
  }

  errors.value = map
  return Object.keys(map).length === 0
}

async function onSave(): Promise<void> {
  if (!validate()) return

  saving.value = true
  try {
    const fields: Record<string, string> = {}
    for (const name of fieldNames.value) fields[name] = form.fields[name] ?? ''

    const draft: NoteDraft = {
      noteTypeId: form.noteTypeId,
      deckId: form.deckId,
      fields,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    }

    if (editing.value) {
      await notesStore.update(editing.value.id, draft)
      toast.add({
        severity: 'success',
        summary: 'Сохранено',
        detail: 'Заметка обновлена',
        life: 3000,
      })
    } else {
      await notesStore.create(draft)
      toast.add({
        severity: 'success',
        summary: 'Создано',
        detail: 'Заметка добавлена',
        life: 3000,
      })
    }
    close()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: notesStore.error ?? 'Не удалось сохранить заметку',
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

function onVisibilityChange(value: boolean): void {
  if (!value) close()
}
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
