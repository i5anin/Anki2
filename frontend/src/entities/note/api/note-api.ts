import { http } from '@/shared/api'

import type { Note, NoteDraft } from '../model/types'

const RESOURCE = '/api/notes'

/** REST-клиент сущности «Заметка». */
export const noteApi = {
  async getList(deckId?: string): Promise<Note[]> {
    const { data } = await http.get<Note[]>(RESOURCE, {
      params: deckId ? { deckId } : undefined,
    })
    return data
  },

  async getById(id: string): Promise<Note> {
    const { data } = await http.get<Note>(`${RESOURCE}/${id}`)
    return data
  },

  async create(draft: NoteDraft): Promise<Note> {
    const { data } = await http.post<Note>(RESOURCE, draft)
    return data
  },

  async update(id: string, draft: Partial<NoteDraft>): Promise<Note> {
    const { data } = await http.patch<Note>(`${RESOURCE}/${id}`, draft)
    return data
  },

  async remove(id: string): Promise<void> {
    await http.delete(`${RESOURCE}/${id}`)
  },
}
