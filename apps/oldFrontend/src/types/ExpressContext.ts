import type { NextFunction, Response, Request } from 'express';

export interface ExpressContext {
  request: Request;
  response: Response;
  next: NextFunction;
}
