/**
 * Barrel export for the API configuration module and typed environment shape.
 */
import type { EnvConfig } from './env.validation';

export { ConfigModule } from './config.module';
export { EnvConfig } from './env.validation';
export { getWinstonConfig } from './logger.config';

export type AppEnv = EnvConfig;
