import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getErrorMessage } from '@/shared/api'

import { deckApi } from '../api/deck-api'
import type { DeckDraft, DeckWithCounts } from './types'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<DeckWithCounts[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const total = computed(() => decks.value.length)
  const totalDue = computed(() => decks.value.reduce((sum, d) => sum + d.counts.due, 0))

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      decks.value = await deckApi.getList()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function create(draft: DeckDraft): Promise<void> {
    error.value = null
    try {
      await deckApi.create(draft)
      await fetchAll()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  async function update(id: string, draft: Partial<DeckDraft>): Promise<void> {
    error.value = null
    try {
      await deckApi.update(id, draft)
      await fetchAll()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = null
    try {
      await deckApi.remove(id)
      await fetchAll()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  return { decks, isLoading, error, total, totalDue, fetchAll, create, update, remove }
})
