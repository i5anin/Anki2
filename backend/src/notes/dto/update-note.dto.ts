import { IsArray, IsObject, IsOptional, IsString } from 'class-validator'

import type { NoteFields } from '../../domain/note.entity'

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  deckId?: string

  @IsOptional()
  @IsObject({ message: 'Поля заметки должны быть объектом' })
  fields?: NoteFields

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Теги должны быть строками' })
  tags?: string[]
}
