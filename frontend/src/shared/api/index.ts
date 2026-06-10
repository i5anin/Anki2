import { isAxiosError } from 'axios'

export { http } from './http'

interface ValidationErrorBody {
  errors?: { field: string; message: string }[]
}

/** Достаёт человекочитаемое сообщение об ошибке из ответа API. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ValidationErrorBody | { message?: string } | undefined
    if (data !== undefined && 'errors' in data && data.errors !== undefined && data.errors.length > 0) {
      return data.errors.map((item) => item.message).join('; ')
    }
    if (data !== undefined && 'message' in data && data.message !== undefined && data.message !== '') {
      return data.message
    }
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Не удалось выполнить запрос к серверу'
}
