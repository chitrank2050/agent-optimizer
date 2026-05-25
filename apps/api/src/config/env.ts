import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  LOCATION_ID: z.string().optional(),
  LOCATION_PIT: z.string().optional(),
  AGENT_ID: z.string().optional(),
  ACCOUNT_PIT: z.string().optional(),
  GHL_APP_SHARED_SECRET: z.string().optional(),
  GHL_PRIVATE_INTEGRATION_TOKEN: z.string().optional(),
  GHL_API_BASE_URL: z.string().url().default('https://services.leadconnectorhq.com'),
  GHL_API_VERSION: z.string().min(1).default('2021-07-28'),
  OPENAI_API_KEY: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  return envSchema.parse(config);
}
