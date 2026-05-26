/**
 * RequestLoggerMiddleware - Logs every incoming request and its response time.
 */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { CORRELATION_ID_HEADER } from '../constants';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl } = req;
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string;

    // Skip health checks - they fire every few seconds and clutter logs.
    if (originalUrl === '/health') {
      return next();
    }

    // The 'finish' event fires when the response has been sent to the client.
    // This is where we calculate the total request duration.
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const message = `[${correlationId}] ${method} ${originalUrl} → ${statusCode} (${duration}ms)`;

      // Color-code by status: 2xx = log, 4xx = warn, 5xx = error
      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
