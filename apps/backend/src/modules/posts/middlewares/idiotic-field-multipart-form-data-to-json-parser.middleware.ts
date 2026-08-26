import type Express from 'express';
import { AppError } from '@/shared/errors/app.error';

export const idioticFieldMultipartFormDataToJsonParser = (fields: Array<string>): Express.RequestHandler => {
  return (...[request, , next]) => {
    for (const field of fields) {
      if (typeof request.body[field] === 'string') {
        try {
          request.body[field] = JSON.parse(request.body[field]);
        } catch {
          throw new AppError(400, `Invalid JSON in field '${field}'`);
        }
      }
    }
    next();
  };
};
