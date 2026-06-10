import { http } from '@/shared/api'

import type { TrainerResult, TrainerResultDraft } from '../model/types'

const RESOURCE = '/api/trainers/results'

export interface TrainerResultFilter {
  trainerId?: string
  since?: string
}

/** REST-клиент результатов тренажёров. */
export const trainerApi = {
  async getResults(filter: TrainerResultFilter = {}): Promise<TrainerResult[]> {
    const params: Record<string, string> = {}
    if (filter.trainerId !== undefined && filter.trainerId.length > 0) {
      params.trainerId = filter.trainerId
    }
    if (filter.since !== undefined && filter.since.length > 0) {
      params.since = filter.since
    }
    const { data } = await http.get<TrainerResult[]>(RESOURCE, { params })
    return data
  },

  async saveResult(draft: TrainerResultDraft): Promise<TrainerResult> {
    const { data } = await http.post<TrainerResult>(RESOURCE, draft)
    return data
  },
}
