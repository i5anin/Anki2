import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage } from '@/shared/api'

import { noteTypeApi } from '../api/note-type-api'
import type { NoteType } from './types'

export const useNoteTypesStore = defineStore('note-types', () => {
  const noteTypes = ref<NoteType[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      noteTypes.value = await noteTypeApi.getList()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { noteTypes, isLoading, error, fetchAll }
})
