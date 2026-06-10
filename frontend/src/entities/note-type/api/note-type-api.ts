import { http } from '@/shared/api'

import type { NoteType, NoteTypeDraft } from '../model/types'

const RESOURCE = '/api/note-types'

/** REST-клиент сущности «Модель заметки». */
export const noteTypeApi = {
  async getList(): Promise<NoteType[]> {
    const { data } = await http.get<NoteType[]>(RESOURCE)
    return data
  },

  async getById(id: string): Promise<NoteType> {
    const { data } = await http.get<NoteType>(`${RESOURCE}/${id}`)
    return data
  },

  async create(draft: NoteTypeDraft): Promise<NoteType> {
    const { data } = await http.post<NoteType>(RESOURCE, draft)
    return data
  },

  async update(id: string, draft: Partial<NoteTypeDraft>): Promise<NoteType> {
    const { data } = await http.patch<NoteType>(`${RESOURCE}/${id}`, draft)
    return data
  },

  async remove(id: string): Promise<void> {
    await http.delete(`${RESOURCE}/${id}`)
  },
}
