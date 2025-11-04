import { type NextFunction, type Response, type Request } from 'express';
import { type InjectionKey } from 'vue';

export interface ExpressContext {
  request: Request;
  response: Response;
  next: NextFunction;
}

export const INJECTION_KEY_EXPRESS_CONTEXT: InjectionKey<ExpressContext> = Symbol('expressContext');
