/**
 * API bootstrap entry point.
 *
 * Creates the NestJS application, applies security/CORS/global prefix settings,
 * publishes Swagger docs, and enables graceful Prisma shutdown hooks.
 */
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { API_PREFIX, API_VERSION, APP_NAME } from './common/constants';
import { type AppEnv, getWinstonConfig } from './modules/config';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const ENV = process.env.NODE_ENV ?? 'development';

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(getWinstonConfig(ENV)),
    rawBody: true,
  });

  const config = app.get(ConfigService<AppEnv, true>);
  const frontendOrigin = config.get('FRONTEND_ORIGIN', { infer: true });
  const port =
    config.get('PORT', { infer: true }) ?? config.get('API_PORT', { infer: true }) ?? 3000;

  app.use(
    helmet({
      contentSecurityPolicy: ENV === 'production',
    }),
  );

  app.use(compression());

  app.enableCors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX, {
    exclude: ['health'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });

  // app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Voice AI Agent Optimizer API')
      .setDescription('HighLevel Voice AI agent optimization and transcript analysis API.')
      .setVersion(API_VERSION)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(`${API_PREFIX}/swagger`, app, document, {
      jsonDocumentUrl: `${API_PREFIX}/docs-json`,
    });

    const { apiReference } = await import('@scalar/nestjs-api-reference');
    app.use(
      `/${API_PREFIX}/docs`,
      apiReference({
        content: document,
        theme: 'solarized',
      }),
    );
  }

  app.enableShutdownHooks();
  app.get(PrismaService).enableShutdownHooks(app);

  // =============================================================
  // Start listening
  // =============================================================
  await app.listen(port);

  console.log(`
  ┌──────────────────────────────────────────────┐
  │  ${APP_NAME} API running                     │
  │  Local:   http://localhost:${String(port).padEnd(4)}              │
  │  Docs:    http://localhost:${String(port).padEnd(4)}/api/docs     │
  │  Health:  http://localhost:${String(port).padEnd(4)}/health       │
  │  Mode:    ${String(ENV ?? 'development').padEnd(35)}│
  └──────────────────────────────────────────────┘
  `);
}

void bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
