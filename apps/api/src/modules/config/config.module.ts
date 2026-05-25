/**
 * ConfigModule - Global Nest configuration wrapper.
 *
 * Loads the root monorepo `.env` file and validates the environment at boot
 * before any provider can open a database or HighLevel connection.
 */
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { resolve } from 'path';

import { validate } from './env.validation';

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
