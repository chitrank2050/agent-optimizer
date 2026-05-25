import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AnalysisModule } from './analysis/analysis.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ConfigModule } from './modules/config';
import { OptimizationModule } from './optimization/optimization.module';
import { PrismaModule } from './prisma/prisma.module';

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
