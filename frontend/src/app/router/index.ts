import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'decks',
    component: () => import('@/pages/decks'),
  },
  {
    path: '/study/:deckId',
    name: 'study',
    component: () => import('@/pages/study'),
  },
  {
    path: '/decks/:deckId/cards',
    name: 'browse',
    component: () => import('@/pages/browse'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/pages/stats'),
  },
  {
    path: '/note-types',
    name: 'note-types',
    component: () => import('@/pages/note-types'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
