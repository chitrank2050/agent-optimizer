/**
 * AppModule - Root NestJS module for the Agent Optimizer API.
 *
 * Registers global infrastructure first, then feature modules for health,
 * HighLevel synchronization, transcript analysis, and optimization workflows.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AnalysisModule } from './modules/analysis/analysis.module';
import { CorrelationIdMiddleware } from './modules/common/middleware/correlation-id.middleware';
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
    IntegrationsModule,
    AnalysisModule,
    OptimizationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('{*path}');
  }
}
