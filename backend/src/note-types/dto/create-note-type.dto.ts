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

export class CardTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Не указано имя шаблона' })
  name!: string

  @IsString()
  front!: string

  @IsString()
  back!: string
}

export class CreateNoteTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Не указано имя модели' })
  @MaxLength(60, { message: 'Имя модели: не более 60 символов' })
  name!: string

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Нужно хотя бы одно поле' })
  fields!: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardTemplateDto)
  templates!: CardTemplateDto[]

  @IsOptional()
  @IsBoolean()
  isCloze?: boolean
}
