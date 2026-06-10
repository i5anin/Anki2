import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage } from '@/shared/api'

import { noteApi } from '../api/note-api'
import type { Note, NoteDraft } from './types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const deckId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(deck?: string): Promise<void> {
    deckId.value = deck ?? null
    isLoading.value = true
    error.value = null
    try {
      notes.value = await noteApi.getList(deck)
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function reload(): Promise<void> {
    await fetchAll(deckId.value ?? undefined)
  }

  async function create(draft: NoteDraft): Promise<void> {
    error.value = null
    try {
      await noteApi.create(draft)
      await reload()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  async function update(id: string, draft: Partial<NoteDraft>): Promise<void> {
    error.value = null
    try {
      await noteApi.update(id, draft)
      await reload()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = null
    try {
      await noteApi.remove(id)
      await reload()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  return { notes, deckId, isLoading, error, fetchAll, reload, create, update, remove }
})
