/**
 * PrismaModule - Global database access module.
 *
 * Exports a singleton PrismaService so feature modules can use the database
 * without repeatedly importing database infrastructure.
 */
import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
