import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

import type { NoteFields } from '../../domain/note.entity'

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty({ message: 'Не указана модель заметки' })
  noteTypeId!: string

  @IsString()
  @IsNotEmpty({ message: 'Не указана колода' })
  deckId!: string

  @IsObject({ message: 'Поля заметки должны быть объектом' })
  fields!: NoteFields

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Теги должны быть строками' })
  tags?: string[]
}
