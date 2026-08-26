import Express from 'express';
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

import { AppError } from '@/shared/errors/app-error';
import { errorHandler } from '@/middlewares/error-handler';

describe('errorHandler', () => {
  it('returns app error status and body for AppError', async () => {
    const app = Express();

    app.get('/posts', () => {
      throw new AppError(404, 'Not found');
    });

    app.use(errorHandler);

    const response = await request(app).get('/posts').expect(404);

    expect(loggerError).toHaveBeenCalledWith('/posts Error: Not found');
    expect(response.body).toMatchObject({ statusCode: 404 });
  });

  it('returns 500 generic payload for unknown error', async () => {
    const app = Express();

    app.get('/posts', () => {
      throw new Error('boom');
    });

    app.use(errorHandler);

    const response = await request(app).get('/posts').expect(500);

    expect(response.body).toEqual({ message: 'Something went wrong :(' });
  });
});
