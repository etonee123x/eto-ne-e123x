import jsonWebToken from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import Express from 'express';

export const cookieAuth: Express.RequestHandler = (request, response, next) => {
  const jwt = request.cookies[KEY_COOKIE_JWT] || request.query.jwt;

  if (typeof jwt !== 'string') {
    response.clearCookie(KEY_COOKIE_JWT);
    throw createHttpError(401);
  }

  try {
    const payload = jsonWebToken.verify(jwt, String(process.env.SECRET_KEY));

    response.cookie(KEY_COOKIE_JWT, jwt, {
      expires: typeof payload === 'object' && payload.exp ? new Date(payload.exp * 1000) : undefined,
    });
    request.cookies[KEY_COOKIE_JWT] = jwt;

    next();
  } catch (error) {
    response.clearCookie(KEY_COOKIE_JWT);
    throw createHttpError(401, String(error));
  }
};
