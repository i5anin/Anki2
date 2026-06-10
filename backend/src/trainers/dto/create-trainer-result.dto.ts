import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator'

import type { TrainerSkill } from '../../domain/trainer-result.entity'

const SKILLS: TrainerSkill[] = ['attention', 'memory', 'speed', 'logic']

export class CreateTrainerResultDto {
  @IsString()
  @IsNotEmpty({ message: 'Не указан тренажёр' })
  @MaxLength(40)
  trainerId!: string

  @IsIn(SKILLS, { message: 'Неизвестный навык' })
  skill!: TrainerSkill

  @IsInt()
  @Min(1)
  @Max(99)
  level!: number

  @IsInt()
  @Min(0)
  score!: number

  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy!: number

  @IsInt()
  @Min(0)
  durationMs!: number
}
