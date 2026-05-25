/**
 * Environment validation for the API process.
 *
 * Uses class-validator/class-transformer to fail fast when required root `.env`
 * values are missing or malformed.
 */
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvConfig {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  API_PORT: number = 3000;

  @IsUrl({ require_tld: false })
  FRONTEND_ORIGIN: string = 'http://localhost:5173';

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  LOCATION_ID?: string;

  @IsString()
  @IsOptional()
  LOCATION_PIT?: string;

  @IsString()
  @IsOptional()
  AGENT_ID?: string;

  @IsString()
  @IsOptional()
  ACCOUNT_PIT?: string;

  @IsString()
  @IsOptional()
  GHL_APP_SHARED_SECRET?: string;

  @IsString()
  @IsOptional()
  GHL_PRIVATE_INTEGRATION_TOKEN?: string;

  @IsUrl({ require_tld: false })
  GHL_API_BASE_URL: string = 'https://services.leadconnectorhq.com';

  @IsString()
  GHL_API_VERSION: string = '2021-07-28';

  @IsString()
  @IsOptional()
  OPENAI_API_KEY?: string;
}

/**
 * Validates environment variables at process boot.
 */
export function validate(config: Record<string, unknown>): EnvConfig {
  const validated = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => {
        const constraints = Object.values(err.constraints ?? {}).join(', ');
        return `  ${err.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(`\n\nEnvironment validation failed:\n${messages}\n\n`);
  }

  return validated;
}
