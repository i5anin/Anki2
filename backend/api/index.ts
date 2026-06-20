import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { validationExceptionFactory } from '../src/common/validation-exception.factory'
import { AppModule } from '../src/app.module'
import type { IncomingMessage, ServerResponse } from 'node:http'

let handler: ((req: IncomingMessage, res: ServerResponse) => void) | undefined

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false })

  app.setGlobalPrefix('api')
  app.enableCors({ origin: true })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Anki2 API')
    .setDescription('REST API интервального повторения (NestJS + Supabase)')
    .setVersion('1.0')
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig))

  await app.init()
  return app.getHttpAdapter().getInstance()
}

export default async function (req: IncomingMessage, res: ServerResponse) {
  if (!handler) handler = await bootstrap()
  handler(req, res)
}
