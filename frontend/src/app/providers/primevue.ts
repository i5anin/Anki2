import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import type { App } from 'vue'

/** Подключает PrimeVue с пресетом Aura и тёмной темой по классу .app-dark. */
export function installPrimeVue(app: App): void {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.app-dark',
        cssLayer: false,
      },
    },
  })
  app.use(ToastService)
  app.use(ConfirmationService)
}
