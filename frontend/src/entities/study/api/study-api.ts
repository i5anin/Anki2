import { http } from '@/shared/api'

import type { IntervalPreview, Rating, ReviewResult, StudyQueue } from '../model/types'

const RESOURCE = '/api/study'

export interface ReviewPayload {
  cardId: string
  rating: Rating
  timeTakenMs: number
}

/** REST-клиент учебной сессии. */
export const studyApi = {
  async getQueue(deckId: string): Promise<StudyQueue> {
    const { data } = await http.get<StudyQueue>(`${RESOURCE}/${deckId}/queue`)
    return data
  },

  async getPreview(deckId: string, cardId: string): Promise<IntervalPreview[]> {
    const { data } = await http.get<{ previews: IntervalPreview[] }>(
      `${RESOURCE}/${deckId}/preview/${cardId}`,
    )
    return data.previews
  },

  async review(payload: ReviewPayload): Promise<ReviewResult> {
    const { data } = await http.post<ReviewResult>(`${RESOURCE}/review`, payload)
    return data
  },
}
