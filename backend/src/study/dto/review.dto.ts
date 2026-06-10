import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'

export class ReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Не указана карточка' })
  cardId!: string

  @IsInt({ message: 'Оценка должна быть целым числом' })
  @Min(1, { message: 'Оценка: от 1 до 4' })
  @Max(4, { message: 'Оценка: от 1 до 4' })
  rating!: 1 | 2 | 3 | 4

  @IsOptional()
  @IsInt({ message: 'Время ответа должно быть целым числом' })
  @Min(0, { message: 'Время ответа не может быть отрицательным' })
  timeTakenMs?: number
}
