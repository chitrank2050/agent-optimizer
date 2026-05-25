import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppEnv } from './modules/config';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  const frontendOrigin = config.get('FRONTEND_ORIGIN', { infer: true });
  const port = config.get('API_PORT', { infer: true });

  app.use(helmet());
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.get(PrismaService).enableShutdownHooks(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voice AI Agent Optimizer API')
    .setDescription('HighLevel Voice AI agent optimization and transcript analysis API.')
    .setVersion('0.1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(port);
}

void bootstrap();
