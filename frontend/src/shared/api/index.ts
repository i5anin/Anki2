import { isAxiosError } from 'axios'

export { http } from './http'

interface ValidationErrorBody {
  errors?: Array<{ field: string; message: string }>
}

/** Достаёт человекочитаемое сообщение об ошибке из ответа API. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ValidationErrorBody | { message?: string } | undefined
    if (data && 'errors' in data && data.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.message).join('; ')
    }
    if (data && 'message' in data && data.message) return data.message
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Не удалось выполнить запрос к серверу'
}
