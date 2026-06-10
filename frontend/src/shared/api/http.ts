import axios, { type AxiosInstance } from 'axios'

import { config } from '@/shared/config'

/** Единый HTTP-клиент приложения. Базовый URL берётся из конфигурации. */
export const http: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
