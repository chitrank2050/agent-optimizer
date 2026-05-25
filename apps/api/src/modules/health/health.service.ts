import { Inject, Injectable } from '@nestjs/common';
import type { HealthResponse } from '@agent-optimizer/contracts';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async check(correlationId: string): Promise<HealthResponse> {
    const database = await this.checkDatabase();

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      service: 'agent-optimizer-api',
      timestamp: new Date().toISOString(),
      correlationId,
      checks: {
        api: 'ok',
        database,
      },
    };
  }

  private async checkDatabase(): Promise<'ok' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'down';
    }
  }
}
