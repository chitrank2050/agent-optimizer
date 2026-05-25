import { Controller, Get, Inject, Req } from '@nestjs/common';
import type { HealthResponse } from '@agent-optimizer/contracts';
import type { Request } from 'express';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  async check(@Req() request: Request): Promise<HealthResponse> {
    return this.healthService.check(request.correlationId);
  }
}
