import type Express from 'express';
import { AppError } from '@/shared/errors/app.error';

export const idioticFieldMultipartFormDataToJsonParser = (fields: Array<string>): Express.RequestHandler => {
  return (...[request, , next]) => {
    const body = request.body as Record<string, unknown>;
    for (const field of fields) {
      const fieldValue = body[field];
      if (typeof fieldValue === 'string') {
        try {
          body[field] = JSON.parse(fieldValue) as unknown;
        } catch {
          throw new AppError(400, `Invalid JSON in field '${field}'`);
        }
      }
    }
    next();
  };
};
