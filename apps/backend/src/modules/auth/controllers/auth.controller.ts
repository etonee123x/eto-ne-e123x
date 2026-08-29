import { cookieAuth } from '@/middlewares/cookie-auth.middleware';
import { rateLimit } from 'express-rate-limit';
import type { RequestHandlerTyped } from '@/types/request-handler-typed';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { AppError } from '@/shared/errors/app.error';
import { Controller } from '@/shared/controller';
import { AuthService } from '../services/auth.service';

export class AuthController extends Controller {
  private readonly authService: AuthService;

  private login: RequestHandlerTyped<'/auth', 'post'> = (request, response) => {
    const maybeJwt: unknown = request.query.jwt;

    if (!maybeJwt) {
      throw new AppError(400, 'JWT is not found in request query');
    }

    if (typeof maybeJwt !== 'string') {
      throw new AppError(400, 'JWT is not a string');
    }

    const { expires } = this.authService.login({ jwt: maybeJwt });

    response.cookie(KEY_COOKIE_JWT, maybeJwt, { ...AuthService.cookieOptions, expires });

    return response.send({ jwt: maybeJwt });
  };

  private logout: RequestHandlerTyped<'/auth', 'delete'> = (...[, response]) => {
    response.clearCookie(KEY_COOKIE_JWT, AuthService.cookieOptions);

    return response.send({ jwt: null });
  };

  constructor(parameters: { authService: AuthService }) {
    super();

    this.authService = parameters.authService;

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
