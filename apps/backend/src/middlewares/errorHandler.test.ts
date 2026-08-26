import type Express from 'express';
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

import { AppError } from '@/shared/errors/AppError';
import { errorHandler } from '@/middlewares/errorHandler';

describe('errorHandler', () => {
  it('returns app error status and body for AppError', () => {
    const json = vi.fn();
    const setStatus = vi.fn(() => {
      return { json };
    });

    const request = {
      originalUrl: '/posts',
    } as Express.Request;

    const response = {
      status: setStatus,
    } as unknown as Express.Response;

    const appError = new AppError(404, 'Not found');

    errorHandler(appError, request, response, vi.fn());

    expect(loggerError).toHaveBeenCalledWith('/posts Error: Not found');
    expect(setStatus).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(appError);
  });

  it('returns 500 generic payload for unknown error', () => {
    const json = vi.fn();
    const setStatus = vi.fn(() => {
      return { json };
    });

    const request = {
      originalUrl: '/posts',
    } as Express.Request;

    const response = {
      status: setStatus,
    } as unknown as Express.Response;

    errorHandler(new Error('boom'), request, response, vi.fn());

    expect(setStatus).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Something went wrong :(' });
  });
});
