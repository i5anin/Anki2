const DEFAULT_API_BASE_URL = 'http://localhost:3000'
const DEFAULT_APP_TITLE = 'Anki2'

/** Значение переменной окружения или запасное, если она пуста. */
function fromEnv(value: string | undefined, fallback: string): string {
  return value !== undefined && value.length > 0 ? value : fallback
}

/** Конфигурация приложения из переменных окружения Vite. */
export const config = {
  apiBaseUrl: fromEnv(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  appTitle: fromEnv(import.meta.env.VITE_APP_TITLE, DEFAULT_APP_TITLE),
} as const
