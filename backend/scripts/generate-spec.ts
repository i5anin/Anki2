import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '../src/app.module'

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false })
  app.setGlobalPrefix('api')

  const config = new DocumentBuilder()
    .setTitle('Anki2 API')
    .setDescription('REST API интервального повторения (NestJS + Supabase)')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  const outPath = resolve('../docs/openapi.json')
  writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf8')

  console.log(`OpenAPI spec written to ${outPath}`)
  await app.close()
}

void main()
