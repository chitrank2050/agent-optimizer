/**
 * Prisma CLI configuration.
 *
 * Prisma 7 moved datasource URLs out of schema.prisma. The schema now only
 * declares the provider; migrations and generate read DATABASE_URL here.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

// Resolve the root .env file relative to this configuration file
config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});
