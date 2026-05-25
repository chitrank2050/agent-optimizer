import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { resolve } from 'path';

import { validate } from './env.validation';

/**
 * Global application configuration.
 *
 * The monorepo keeps a single root `.env`; this module resolves it explicitly so
 * the API behaves the same whether commands run from the repo root or app folder.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')],
    }),
  ],
})
export class ConfigModule {}
