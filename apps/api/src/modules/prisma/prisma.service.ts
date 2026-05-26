/**
 * PrismaService - Injectable Prisma 7 client with lifecycle hooks.
 *
 * Uses the PostgreSQL driver adapter required by Prisma 7 and shuts down the
 * Nest application when Prisma emits a before-exit signal.
 */
import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL as string,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL...');
    await this.$connect();
    this.logger.log('PostgreSQL connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from PostgreSQL...');
    await this.$disconnect();
    this.logger.log('PostgreSQL disconnected');
  }

  enableShutdownHooks(app: INestApplication): void {
    this.logger.log('Registering shutdown hooks...');
    process.once('beforeExit', () => {
      this.logger.log('Closing application...');
      void app.close();
    });
    this.logger.log('Shutdown hooks registered');
  }
}
