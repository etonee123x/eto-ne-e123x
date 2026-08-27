import Express from 'express';
import jsonWebToken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { appConfig } from '@/config/app-config';
import { AppError } from '@/shared/errors/app.error';

const getCookieOptions = (): Express.CookieOptions => {
  return {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: 'lax',
    path: '/',
  };
};

export const cookieAuth: Express.RequestHandler = (request, response, next) => {
  const { secretKey } = appConfig;

  const cookies = request.cookies as Record<string, unknown>;
  const jwt = cookies[KEY_COOKIE_JWT];
  const cookieOptions = getCookieOptions();

  if (typeof jwt !== 'string' || !jwt) {
    response.clearCookie(KEY_COOKIE_JWT, cookieOptions);
    throw new AppError(401);
  }

  try {
    const payload = jsonWebToken.verify(jwt, secretKey, {
      algorithms: ['HS256', 'HS384', 'HS512'],
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
