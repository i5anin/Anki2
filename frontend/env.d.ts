/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL REST API бэкенда, напр. http://localhost:3000 */
  readonly VITE_API_BASE_URL: string
  /** Отображаемое имя продукта в шапке/заголовке */
  readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
