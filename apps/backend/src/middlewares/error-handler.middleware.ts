import { AppError } from '@/shared/errors/app.error';
import { logger } from '@/shared/logger';
import { sanitizeUrl } from '@/utils/sanitize-url';
import type { ErrorRequestHandler } from 'express';

// надо 4 параметра, чтобы экспресс понимал, что это обработчик ошибок
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  const safeUrl = sanitizeUrl(request.originalUrl);
  logger.error([safeUrl, error instanceof Error ? error.message : String(error)].join(' '));

  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
    return response.status(413).json(new AppError(413, 'Payload Too Large'));
  }

  return error instanceof AppError
    ? response.status(error.statusCode).json(error)
    : response.status(500).json({ message: 'Something went wrong :(' });
};
