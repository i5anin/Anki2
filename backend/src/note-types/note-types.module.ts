import { Module } from '@nestjs/common'

import { NoteTypesController } from './note-types.controller'
import { NoteTypesService } from './note-types.service'

@Module({
  controllers: [NoteTypesController],
  providers: [NoteTypesService],
})
export class NoteTypesModule {}
