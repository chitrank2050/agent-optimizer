/**
 * AppModule - Root NestJS module for the Agent Optimizer API.
 *
 * Registers global infrastructure first, then feature modules for health,
 * HighLevel synchronization, transcript analysis, and optimization workflows.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CorrelationIdMiddleware,  RequestLoggerMiddleware } from './common/middleware';

import { AnalysisModule } from './modules/analysis/analysis.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ConfigModule } from './modules/config';
import { OptimizationModule } from './modules/optimization/optimization.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HealthModule,
    // Feature modules
    IntegrationsModule,
    AnalysisModule,
    OptimizationModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Middleware runs in the order registered, on every matching route.
   *
   * Order matters:
   *   1. CorrelationIdMiddleware - assigns x-correlation-id
   *   2. RequestLoggerMiddleware - logs request with that correlation ID
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggerMiddleware)
      .forRoutes('{*path}');
  }
}
