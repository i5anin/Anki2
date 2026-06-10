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
    path: '/decks/:deckId/cards',
    name: 'browse',
    component: async () => import('@/pages/browse'),
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
