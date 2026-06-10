import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateCardDto {
  @IsOptional()
  @IsString({ message: 'Колода: ожидается строка' })
  deckId?: string

  @IsOptional()
  @IsBoolean({ message: 'Признак приостановки: ожидается булево значение' })
  isSuspended?: boolean
}
