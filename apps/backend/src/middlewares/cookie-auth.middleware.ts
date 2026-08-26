import Express from 'express';
import jsonWebToken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { isNodeEnvProduction } from '@/constants/node-env';
import { AppError } from '@/shared/errors/app.error';

const COOKIE_OPTIONS: Express.CookieOptions = {
  httpOnly: true,
  secure: isNodeEnvProduction,
  sameSite: 'lax',
  path: '/',
};

export const cookieAuth: Express.RequestHandler = (request, response, next) => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey || secretKey === 'undefined' || secretKey.trim() === '') {
    throw new AppError(500, 'SECRET_KEY environment variable is not configured');
  }

  const jwt = request.cookies[KEY_COOKIE_JWT];

  if (typeof jwt !== 'string' || !jwt) {
    response.clearCookie(KEY_COOKIE_JWT, COOKIE_OPTIONS);
    throw new AppError(401);
  }

  try {
    const payload = jsonWebToken.verify(jwt, secretKey, {
      algorithms: ['HS256', 'HS384', 'HS512'],
    });

    response.cookie(KEY_COOKIE_JWT, jwt, {
      ...COOKIE_OPTIONS,
      expires: typeof payload === 'object' && payload.exp ? new Date(payload.exp * 1000) : undefined,
    });
    request.cookies[KEY_COOKIE_JWT] = jwt;

    next();
  } catch {
    response.clearCookie(KEY_COOKIE_JWT, COOKIE_OPTIONS);
    throw new AppError(401);
  }
};
