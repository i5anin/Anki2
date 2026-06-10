import { createPinia } from 'pinia'
import type { App } from 'vue'

import { router } from '../router'
import { installPrimeVue } from './primevue'

/** Регистрирует все плагины приложения: Pinia, маршрутизатор, PrimeVue. */
export function installProviders(app: App): void {
  app.use(createPinia())
  app.use(router)
  installPrimeVue(app)
}
