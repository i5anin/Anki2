import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'decks',
    component: async () => import('@/pages/decks'),
  },
  {
    path: '/study/:deckId',
    name: 'study',
    component: async () => import('@/pages/study'),
  },
  {
    path: '/quiz',
    name: 'quiz-hub',
    component: async () => import('@/pages/blitz-hub'),
  },
  {
    path: '/quiz/topic/:category',
    name: 'quiz-topic',
    component: async () => import('@/pages/quiz'),
  },
  {
    path: '/quiz/:deckId',
    name: 'quiz',
    component: async () => import('@/pages/quiz'),
  },
  {
    path: '/decks/:deckId/cards',
    name: 'browse',
    component: async () => import('@/pages/browse'),
  },
  {
    path: '/trainers',
    name: 'trainers',
    component: async () => import('@/pages/trainers'),
  },
  {
    path: '/trainers/:trainerId',
    name: 'trainer-play',
    component: async () => import('@/pages/trainer-play'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: async () => import('@/pages/stats'),
  },
  {
    path: '/note-types',
    name: 'note-types',
    component: async () => import('@/pages/note-types'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: async () => import('@/pages/not-found'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
