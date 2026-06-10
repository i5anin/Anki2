import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { computed, reactive, ref, watch, type ComputedRef, type Ref } from 'vue'

import { useDecksStore, type DeckWithCounts } from '@/entities/deck'
import { useNotesStore, type NoteDraft } from '@/entities/note'
import { useNoteTypesStore, type NoteType } from '@/entities/note-type'

import { useManageNote } from './useManageNote'

interface NoteForm {
  noteTypeId: string
  deckId: string
  fields: Record<string, string>
  tags: string
}

interface NoteFormApi {
  isOpen: Ref<boolean>
  title: ComputedRef<string>
  form: NoteForm
  errors: Ref<Record<string, string>>
  saving: Ref<boolean>
  fieldNames: ComputedRef<string[]>
  previewSource: ComputedRef<string>
  clozeHint: string
  noteTypes: Ref<NoteType[]>
  decks: Ref<DeckWithCounts[]>
  onSave: () => Promise<void>
  close: () => void
  onVisibilityChange: (value: boolean) => void
}

/** Логика формы создания/редактирования заметки (для NoteEditorDialog). */
export function useNoteForm(): NoteFormApi {
  const notesStore = useNotesStore()
  const noteTypesStore = useNoteTypesStore()
  const decksStore = useDecksStore()
  const toast = useToast()
  const { isOpen, editing, presetDeckId, close } = useManageNote()

  const { noteTypes } = storeToRefs(noteTypesStore)
  const { decks } = storeToRefs(decksStore)

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

  function rebuildFields(names: string[], source: Record<string, string> = form.fields): void {
    const next: Record<string, string> = {}
    for (const name of names) {
      next[name] = source[name] ?? ''
    }
    form.fields = next
  }

  watch(isOpen, async (open) => {
    if (!open) {
      return
    }
    errors.value = {}
    if (noteTypes.value.length === 0) {
      await noteTypesStore.fetchAll()
    }
    if (decks.value.length === 0) {
      await decksStore.fetchAll()
    }

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

  watch(
    () => form.noteTypeId,
    (id, prev) => {
      if (id === prev) {
        return
      }
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
    if (!validate()) {
      return
    }
    saving.value = true
    try {
      const fields: Record<string, string> = {}
      for (const name of fieldNames.value) {
        fields[name] = form.fields[name] ?? ''
      }
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
        toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Заметка обновлена', life: 3000 })
      } else {
        await notesStore.create(draft)
        toast.add({ severity: 'success', summary: 'Создано', detail: 'Заметка добавлена', life: 3000 })
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
    if (!value) {
      close()
    }
  }

  return {
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
  }
}
