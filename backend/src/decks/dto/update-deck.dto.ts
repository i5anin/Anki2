import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator'

import type { DeckConfig } from '../../srs'

export class UpdateDeckDto {
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Название: не более 60 символов' })
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание: не более 500 символов' })
  description?: string

  @IsOptional()
  @IsObject({ message: 'Конфигурация должна быть объектом' })
  config?: Partial<DeckConfig>
}
