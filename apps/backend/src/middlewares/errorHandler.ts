import { logger } from '@/helpers/logger';
import type { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';

// надо 4 параметра, чтобы экспресс понимал, что это обработчик ошибок
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  logger.error(request.originalUrl, request.body, error);

  return createHttpError.isHttpError(error)
    ? response.status(error.statusCode).json(error)
    : response.status(500).json({ message: 'Something went wrong :(' });
};
