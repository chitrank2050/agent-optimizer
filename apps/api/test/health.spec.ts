import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('HealthController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
        enableShutdownHooks: vi.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns API and database health with a correlation id', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-correlation-id', 'health-test')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'agent-optimizer-api',
      correlationId: 'health-test',
      checks: {
        api: 'ok',
        database: 'ok',
      },
    });
  });
});
