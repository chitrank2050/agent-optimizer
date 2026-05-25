/**
 * Barrel export for the API configuration module and typed environment shape.
 */
import type { EnvConfig } from './env.validation';

export { ConfigModule } from './config.module';
export { EnvConfig } from './env.validation';
export type AppEnv = EnvConfig;
