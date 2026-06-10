import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'

import { CardTemplateDto } from './create-note-type.dto'

export class UpdateNoteTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Не указано имя модели' })
  @MaxLength(60, { message: 'Имя модели: не более 60 символов' })
  name?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Нужно хотя бы одно поле' })
  fields?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardTemplateDto)
  templates?: CardTemplateDto[]

  @IsOptional()
  @IsBoolean()
  isCloze?: boolean
}
