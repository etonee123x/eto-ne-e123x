import type Express from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '@/shared/errors/app.error';

export const validateRequest: Express.RequestHandler = (request, ...[, next]) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => {
      return `${error.type === 'field' ? error.path : 'param'}: ${error.msg}`;
    });
    throw new AppError(400, `Validation error: ${messages.join('; ')}`);
  }
  next();
};
