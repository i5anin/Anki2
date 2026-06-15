import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage } from '@/shared/api'

import type { NoteType } from './types'

import { noteTypeApi } from '../api/note-type-api'

export const useNoteTypesStore = defineStore('note-types', () => {
  const noteTypes = ref<NoteType[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      noteTypes.value = await noteTypeApi.getList()
    } catch (error_) {
      error.value = getErrorMessage(error_)
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  return { noteTypes, isLoading, error, fetchAll }
})
