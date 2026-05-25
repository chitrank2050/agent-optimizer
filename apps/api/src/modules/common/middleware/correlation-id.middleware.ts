/**
 * CorrelationIdMiddleware - Attaches a trace ID to every request.
 *
 * Respects an incoming `x-correlation-id` header when provided, otherwise
 * generates one and mirrors it back on the response for debugging/demo traces.
 */
import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const existingHeader = request.header(CORRELATION_ID_HEADER);
    const correlationId =
      existingHeader && existingHeader.trim().length > 0 ? existingHeader : randomUUID();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
