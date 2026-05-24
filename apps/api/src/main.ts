import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppEnv } from './config/env';
import { PrismaService } from './prisma/prisma.service';

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

  await app.listen(port);
}

void bootstrap();
