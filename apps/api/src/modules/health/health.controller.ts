/**
 * HealthController - Exposes API readiness for local review and deployment checks.
 *
 * Returns service status, database reachability, timestamp, and the active
 * correlation ID so failures can be traced through logs and screenshots.
 */
import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService } from '@nestjs/terminus';
import { randomUUID } from 'crypto';

import type { HealthResponse } from '@agent-optimizer/contracts';

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
  @ApiOperation({ summary: 'Check API and dependency health' })
  async check(@Headers('x-correlation-id') correlationId?: string): Promise<HealthResponse> {
    let result: any;
    try {
      result = await this.health.check([() => this.prismaHealth.isHealthy('postgres')]);
    } catch (err: any) {
      if (err.response) {
        result = err.response;
      } else {
        throw err;
      }
    }

    const isDatabaseUp = result.details?.postgres?.status === 'up';
    const isSystemOk = result.status === 'ok';

    const response: HealthResponse = {
      status: isSystemOk ? 'ok' : 'down',
      service: 'agent-optimizer-api',
      timestamp: new Date().toISOString(),
      correlationId: correlationId || randomUUID(),
      checks: {
        api: 'ok',
        database: isDatabaseUp ? 'ok' : 'down',
      },
    };

    if (response.status !== 'ok') {
      throw new HttpException(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return response;
  }
}
