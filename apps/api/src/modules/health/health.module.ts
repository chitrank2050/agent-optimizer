/**
 * HealthModule - Registers health check controller and service.
 *
 * Kept as a feature module so readiness behavior stays isolated from business
 * modules and remains cheap to test.
 */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
