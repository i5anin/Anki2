import type { ValidationError } from '@nestjs/common'

import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * Преобразует ошибки class-validator в формат, ожидаемый фронтендом:
 * HTTP 422 + тело { errors: [{ field, message }] }.
 */
export function validationExceptionFactory(errors: ValidationError[]): HttpException {
  const flat: { field: string; message: string }[] = []

  const walk = (items: ValidationError[], prefix = ''): void => {
    for (const item of items) {
      const field = prefix ? `${prefix}.${item.property}` : item.property
      if (item.constraints) {
        for (const message of Object.values(item.constraints)) {
          flat.push({ field, message })
        }
      }
      if (item.children && item.children.length > 0) {
        walk(item.children, field)
      }
    }
  }

  walk(errors)
  return new HttpException({ errors: flat }, HttpStatus.UNPROCESSABLE_ENTITY)
}
