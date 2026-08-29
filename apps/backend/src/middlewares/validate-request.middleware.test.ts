import Express from 'express';
import { query } from 'express-validator';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const { loggerError } = vi.hoisted(() => {
  return {
    loggerError: vi.fn(),
  };
});

vi.mock('@/shared/logger', () => {
  return {
    logger: {
      error: loggerError,
    },
  };
});

import { errorHandler } from '@/middlewares/error-handler.middleware';
import { validateRequest } from '@/middlewares/validate-request.middleware';

const buildApp = () => {
  const app = Express();

  app.get(
    '/resource',
    query('email').isEmail().withMessage('must be a valid email'),
    validateRequest,
    (...[, response]) => {
      response.send({ ok: true });
    },
  );
  app.use(errorHandler);

  return app;
};

describe('validateRequest', () => {
  it('passes request when validation succeeds', async () => {
    const response = await request(buildApp()).get('/resource?email=user@example.com').expect(200);

    expect(response.body).toEqual({ ok: true });
  });

  it('returns 400 and reports field validation errors', async () => {
    const response = await request(buildApp()).get('/resource?email=invalid').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
    expect(loggerError).toHaveBeenCalledWith('/resource?email=invalid Validation error: email: must be a valid email');
  });
});
