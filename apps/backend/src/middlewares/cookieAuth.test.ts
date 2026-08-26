import type Express from 'express';
import { describe, expect, it, vi } from 'vitest';

vi.mock('jsonwebtoken', () => {
  return {
    default: {
      verify: vi.fn(),
    },
  };
});

import jsonWebToken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import { AppError } from '@/shared/errors/AppError';
import { cookieAuth } from '@/middlewares/cookieAuth';

const mockedVerify = vi.mocked(jsonWebToken.verify) as unknown as ReturnType<typeof vi.fn>;

describe('cookieAuth', () => {
  it('throws 401 and clears cookie when jwt is missing', () => {
    const clearCookie = vi.fn();
    const setCookie = vi.fn();

    const request = {
      cookies: {},
      query: {},
    } as Express.Request;

    const response = {
      clearCookie,
      cookie: setCookie,
    } as unknown as Express.Response;

    const next = vi.fn();

    expect(() => {
      cookieAuth(request, response, next);
    }).toThrow(AppError);

    expect(clearCookie).toHaveBeenCalledWith(KEY_COOKIE_JWT);
    expect(next).not.toHaveBeenCalled();
  });

  it('verifies jwt from cookie and calls next', () => {
    mockedVerify.mockReturnValue({ exp: 1_700_000_000 });

    const clearCookie = vi.fn();
    const setCookie = vi.fn();

    const request = {
      cookies: { [KEY_COOKIE_JWT]: 'token' },
      query: {},
    } as unknown as Express.Request;

    const response = {
      clearCookie,
      cookie: setCookie,
    } as unknown as Express.Response;

    const next = vi.fn();

    cookieAuth(request, response, next);

    expect(mockedVerify).toHaveBeenCalledWith('token', String(process.env.SECRET_KEY));
    expect(setCookie).toHaveBeenCalledWith(KEY_COOKIE_JWT, 'token', {
      expires: new Date(1_700_000_000 * 1000),
      sameSite: 'lax',
    });
    expect(request.cookies[KEY_COOKIE_JWT]).toBe('token');
    expect(next).toHaveBeenCalledOnce();
  });

  it('uses jwt from query when cookie absent', () => {
    mockedVerify.mockReturnValue({});

    const clearCookie = vi.fn();
    const setCookie = vi.fn();

    const request = {
      cookies: {},
      query: { jwt: 'query-token' },
    } as unknown as Express.Request;

    const response = {
      clearCookie,
      cookie: setCookie,
    } as unknown as Express.Response;

    const next = vi.fn();

    cookieAuth(request, response, next);

    expect(mockedVerify).toHaveBeenCalledWith('query-token', String(process.env.SECRET_KEY));
    expect(setCookie).toHaveBeenCalledWith(KEY_COOKIE_JWT, 'query-token', {
      expires: undefined,
      sameSite: 'lax',
    });
    expect(next).toHaveBeenCalledOnce();
  });

  it('throws 401 and clears cookie when verify fails', () => {
    mockedVerify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const clearCookie = vi.fn();
    const setCookie = vi.fn();

    const request = {
      cookies: { [KEY_COOKIE_JWT]: 'broken' },
      query: {},
    } as unknown as Express.Request;

    const response = {
      clearCookie,
      cookie: setCookie,
    } as unknown as Express.Response;

    const next = vi.fn();

    expect(() => {
      cookieAuth(request, response, next);
    }).toThrow(AppError);

    expect(clearCookie).toHaveBeenCalledWith(KEY_COOKIE_JWT);
    expect(next).not.toHaveBeenCalled();
  });
});
