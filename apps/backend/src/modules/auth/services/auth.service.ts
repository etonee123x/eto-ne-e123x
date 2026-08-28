import jsonWebToken from 'jsonwebtoken';
import type Express from 'express';
import { appConfig } from '@/config/app-config';
import { AppError } from '@/shared/errors/app.error';
import { JWT_ALGORITHMS, JWT_COOKIE_OPTIONS } from '../constants/jwt-cookie.constant';

export class AuthService {
  static readonly cookieOptions: Express.CookieOptions = JWT_COOKIE_OPTIONS;

  login(parameters: { jwt: string }): { expires: Date } {
    const { secretKey, authTokenMaxLifetimeMinutes } = appConfig;
    const maxAuthTokenLifetimeSeconds = authTokenMaxLifetimeMinutes * 60;

    let payload: jsonWebToken.JwtPayload | string;

    try {
      payload = jsonWebToken.verify(parameters.jwt, secretKey, { algorithms: JWT_ALGORITHMS });
    } catch {
      throw new AppError(401);
    }

    const issuedAt = typeof payload === 'object' ? payload.iat : undefined;
    const expiration = typeof payload === 'object' ? payload.exp : undefined;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof issuedAt !== 'number' ||
      typeof expiration !== 'number' ||
      issuedAt > now ||
      now - issuedAt > maxAuthTokenLifetimeSeconds ||
      expiration - issuedAt > maxAuthTokenLifetimeSeconds
    ) {
      throw new AppError(401);
    }

    return { expires: new Date(expiration * 1000) };
  }
}
