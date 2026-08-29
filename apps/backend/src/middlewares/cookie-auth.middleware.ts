import Express from 'express';
import jsonWebToken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { appConfig } from '@/config/app-config';
import { AppError } from '@/shared/errors/app.error';
import { JWT_ALGORITHMS, JWT_COOKIE_OPTIONS } from '@/modules/auth/constants/jwt-cookie.constant';

export const cookieAuth: Express.RequestHandler = (request, response, next) => {
  const { secretKey } = appConfig;

  const cookies = request.cookies as Record<string, unknown>;
  const jwt = cookies[KEY_COOKIE_JWT];
  const cookieOptions = JWT_COOKIE_OPTIONS;

  if (typeof jwt !== 'string' || !jwt) {
    response.clearCookie(KEY_COOKIE_JWT, cookieOptions);
    throw new AppError(401);
  }

  try {
    const payload = jsonWebToken.verify(jwt, secretKey, {
      algorithms: JWT_ALGORITHMS,
    });

    response.cookie(KEY_COOKIE_JWT, jwt, {
      ...cookieOptions,
      expires: typeof payload === 'object' && payload.exp ? new Date(payload.exp * 1000) : undefined,
    });
    cookies[KEY_COOKIE_JWT] = jwt;

    next();
  } catch {
    response.clearCookie(KEY_COOKIE_JWT, cookieOptions);
    throw new AppError(401);
  }
};
