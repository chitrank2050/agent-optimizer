/**
 * Express request augmentation for correlation IDs.
 */
declare namespace Express {
  export interface Request {
    correlationId: string;
  }
}
