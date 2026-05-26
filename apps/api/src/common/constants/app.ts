/** The default API version used if not specified in a controller */
export const API_VERSION = process.env.API_VERSION ?? '1';

/** Global API prefix (e.g., /api) */
export const API_PREFIX = process.env.API_PREFIX ?? 'api';

/** Application name - used in logs, Swagger docs, health checks */
export const APP_NAME = 'Agent Optimizer';

/** Header used to carry correlation ID across requests */
export const CORRELATION_ID_HEADER = 'x-correlation-id';
