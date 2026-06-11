import { http } from '@/shared/api'

import type { QuizItem } from '../model/quiz'

const RESOURCE = '/api/quiz/questions'

/** REST-клиент банка вопросов блица. */
export const quizApi = {
  async getQuestions(category?: string): Promise<QuizItem[]> {
    const params: Record<string, string> = {}
    if (category !== undefined && category.length > 0 && category !== 'all') {
      params.category = category
    }
    const { data } = await http.get<QuizItem[]>(RESOURCE, { params })
    return data
  },
}
