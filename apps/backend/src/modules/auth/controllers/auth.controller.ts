import { cookieAuth } from '@/middlewares/cookie-auth.middleware';
import { rateLimit } from 'express-rate-limit';
import jsonWebToken from 'jsonwebtoken';
import type { RequestHandlerTyped } from '@/types/request-handler-typed';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { appConfig } from '@/config/app-config';
import { AppError } from '@/shared/errors/app.error';
import { Controller } from '@/shared/controller';

export class AuthController extends Controller {
  private login: RequestHandlerTyped<'/auth', 'post'> = (request, response) => {
    const maybeJwt: unknown = request.query.jwt;

    if (!maybeJwt) {
      throw new AppError(400, 'JWT is not found in request query');
    }

    if (typeof maybeJwt !== 'string') {
      throw new AppError(400, 'JWT is not a string');
    }

    const { secretKey, authTokenMaxLifetimeMinutes, isProduction } = appConfig;
    const maxAuthTokenLifetimeSeconds = authTokenMaxLifetimeMinutes * 60;

    try {
      const payload = jsonWebToken.verify(maybeJwt, secretKey, {
        algorithms: ['HS256', 'HS384', 'HS512'],
      });
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

      const expires = new Date(expiration * 1000);

      response.cookie(KEY_COOKIE_JWT, maybeJwt, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        expires,
      });
    } catch {
      throw new AppError(401);
    }

    return response.send({ jwt: maybeJwt });
  };

  private logout: RequestHandlerTyped<'/auth', 'delete'> = (...[, response]) => {
    response.clearCookie(KEY_COOKIE_JWT, {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response.send({ jwt: null });
  };

  constructor() {
    super();

    this.router.post(
      '/auth',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
      }),
      this.login,
    );
    this.router.delete('/auth', cookieAuth, this.logout);
  }
}
