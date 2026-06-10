import { ref } from 'vue'

import type { Note } from '@/entities/note'

// Состояние диалога вынесено в модуль — общий синглтон для кнопок и таблиц.
const isOpen = ref(false)
const editing = ref<Note | null>(null)
const presetDeckId = ref<string | null>(null)

/** Управление диалогом создания/редактирования заметки. */
export function useManageNote() {
  function openCreate(deckId?: string): void {
    editing.value = null
    presetDeckId.value = deckId ?? null
    isOpen.value = true
  }

  function openEdit(note: Note): void {
    editing.value = note
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    editing.value = null
    presetDeckId.value = null
  }

  return { isOpen, editing, presetDeckId, openCreate, openEdit, close }
}
