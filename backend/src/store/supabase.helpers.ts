import { InternalServerErrorException } from '@nestjs/common'

/** Результат запроса supabase-js (минимально необходимая форма). */
interface QueryResult {
  data: unknown
  error: { message: string } | null
}

function check(result: QueryResult): void {
  if (result.error) {
    throw new InternalServerErrorException(result.error.message)
  }
}

/** Список строк (бросает 500 при ошибке). */
export function rows<T>(result: QueryResult): T[] {
  check(result)
  return (result.data ?? []) as T[]
}

/** Одна строка или null (для maybeSingle). */
export function maybe<T>(result: QueryResult): T | null {
  check(result)
  return (result.data as T | null) ?? null
}

/** Ровно одна строка (для single). */
export function one<T>(result: QueryResult): T {
  check(result)
  return result.data as T
}

/** Были ли затронуты строки (для delete ... .select('id')). */
export function affected(result: QueryResult): boolean {
  check(result)
  return ((result.data ?? []) as unknown[]).length > 0
}
