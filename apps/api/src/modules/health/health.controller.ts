/**
 * HealthController - Exposes API readiness for local review and deployment checks.
 *
 * Returns service status, database reachability, timestamp, and the active
 * correlation ID so failures can be traced through logs and screenshots.
 */
import { Controller, Get, Inject, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';

import { PrismaHealthIndicator } from './health.service';


@ApiTags('Health')
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
    constructor(
    @Inject(HealthCheckService) private health: HealthCheckService,
    @Inject(PrismaHealthIndicator) private prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API and dependency health' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Each arrow function returns a health indicator result.
      // If the check throws, Terminus catches it and reports "down".
      () => this.prismaHealth.isHealthy('postgres'),
    ]);
  }
}
