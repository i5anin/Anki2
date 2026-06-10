const DEFAULT_API_BASE_URL = 'http://localhost:3000'
const DEFAULT_APP_TITLE = 'Anki2'

/** Конфигурация приложения из переменных окружения Vite. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  appTitle: import.meta.env.VITE_APP_TITLE || DEFAULT_APP_TITLE,
} as const
