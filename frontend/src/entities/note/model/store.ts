import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage } from '@/shared/api'

import type { Note, NoteDraft } from './types'

import { noteApi } from '../api/note-api'

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
    } catch (error_) {
      error.value = getErrorMessage(error_)
      throw error_
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
    } catch (error_) {
      error.value = getErrorMessage(error_)
      throw error_
    }
  }

  async function update(id: string, draft: Partial<NoteDraft>): Promise<void> {
    error.value = null
    try {
      await noteApi.update(id, draft)
      await reload()
    } catch (error_) {
      error.value = getErrorMessage(error_)
      throw error_
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = null
    try {
      await noteApi.remove(id)
      await reload()
    } catch (error_) {
      error.value = getErrorMessage(error_)
      throw error_
    }
  }

  return { notes, deckId, isLoading, error, fetchAll, reload, create, update, remove }
})
