import { ref } from 'vue'

import type { DeckWithCounts } from '@/entities/deck'

// Состояние диалога вынесено в модуль — общий синглтон для кнопок и сетки колод.
const isOpen = ref(false)
const editing = ref<DeckWithCounts | null>(null)

/** Управление диалогом создания/редактирования колоды. */
export function useManageDeck() {
  function openCreate(): void {
    editing.value = null
    isOpen.value = true
  }

  function openEdit(deck: DeckWithCounts): void {
    editing.value = deck
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    editing.value = null
  }

  return { isOpen, editing, openCreate, openEdit, close }
}
