import { ref, type Ref } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

import { cardApi } from '@/entities/card'
import { deckApi } from '@/entities/deck'
import {
  buildQuiz,
  categoryLabel,
  itemsToQuestions,
  quizApi,
  type QuizQuestion,
} from '@/entities/quiz'

/** Тема банка → колода «Собеседование» для перехода «К повторению». */
const CATEGORY_DECK: Record<string, string> = {
  js: '55555555-5555-5555-5555-555555550001',
  ts: '55555555-5555-5555-5555-555555550002',
  css: '55555555-5555-5555-5555-555555550003',
  vue: '55555555-5555-5555-5555-555555550004',
  'system-design': '55555555-5555-5555-5555-555555550005',
  infra: '55555555-5555-5555-5555-555555550006',
  analysis: '55555555-5555-5555-5555-555555550007',
  management: '55555555-5555-5555-5555-555555550008',
}

interface QuizSource {
  title: Ref<string>
  studyTarget: Ref<RouteLocationRaw | null>
  load: () => Promise<QuizQuestion[]>
}

/**
 * Источник вопросов блица по текущему маршруту:
 *  - /quiz/deck/:deckId   — из карточек колоды (короткие ответы);
 *  - /quiz/topic/:category — из банка вопросов (курируемые варианты).
 */
export function useQuizSource(): QuizSource {
  const route = useRoute()
  const title = ref('Блиц')
  const studyTarget = ref<RouteLocationRaw | null>(null)

  const deckParam = route.params.deckId
  const categoryParam = route.params.category

  async function loadDeck(deckId: string): Promise<QuizQuestion[]> {
    const [deck, cards] = await Promise.all([
      deckApi.getById(deckId),
      cardApi.getList({ deckId }),
    ])
    title.value = deck.name
    studyTarget.value = { name: 'study', params: { deckId } }
    return buildQuiz(cards)
  }

  async function loadTopic(category: string): Promise<QuizQuestion[]> {
    title.value = categoryLabel(category)
    const deckId = CATEGORY_DECK[category]
    studyTarget.value = deckId !== undefined ? { name: 'study', params: { deckId } } : null
    return itemsToQuestions(await quizApi.getQuestions(category))
  }

  async function load(): Promise<QuizQuestion[]> {
    if (typeof deckParam === 'string' && deckParam.length > 0) {
      return loadDeck(deckParam)
    }
    if (typeof categoryParam === 'string' && categoryParam.length > 0) {
      return loadTopic(categoryParam)
    }
    return []
  }

  return { title, studyTarget, load }
}
