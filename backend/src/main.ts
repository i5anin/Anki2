import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { printBanner } from './banner'
import { validationExceptionFactory } from './common/validation-exception.factory'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  const config = app.get(ConfigService)
  const corsOrigin = config.get<string>('CORS_ORIGIN')?.trim()
  app.enableCors({
    origin: corsOrigin && corsOrigin !== '*' ? corsOrigin.split(',').map((o) => o.trim()) : true,
  })

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

  const port = Number(config.get<string>('PORT') ?? 3000)
  await app.listen(port)

  printBanner({
    url: `http://localhost:${port}/api`,
    docs: `http://localhost:${port}/api/docs`,
    supabaseUrl: config.get<string>('SUPABASE_URL') ?? '',
    usingSupabase: Boolean(config.get<string>('SUPABASE_SERVICE_ROLE_KEY')),
  })
}

void bootstrap()
