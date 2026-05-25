/**
 * Prisma CLI configuration.
 *
 * Prisma 7 moved datasource URLs out of schema.prisma. The schema now only
 * declares the provider; migrations and generate read DATABASE_URL here.
 */
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});
