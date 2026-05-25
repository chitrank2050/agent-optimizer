/**
 * HealthModule - Registers health check controller and service.
 *
 * Kept as a feature module so readiness behavior stays isolated from business
 * modules and remains cheap to test.
 */
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
