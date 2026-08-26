import { cookieAuth } from '@/middlewares/cookie-auth.middleware';
import type { RequestHandlerTyped } from '@/types/request-handler-typed';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { isNodeEnvProduction } from '@/constants/node-env';
import { AppError } from '@/shared/errors/app.error';
import { Controller } from '@/shared/controller';

export class AuthController extends Controller {
  private login: RequestHandlerTyped<'/auth', 'post'> = (request, response) => {
    const maybeJwt = request.cookies[KEY_COOKIE_JWT];

    if (!maybeJwt) {
      throw new AppError(400, 'JWT is not found in request cookies');
    }

    if (typeof maybeJwt !== 'string') {
      throw new AppError(400, 'JWT is not a string');
    }

    return response.send({ jwt: maybeJwt });
  };

  private logout: RequestHandlerTyped<'/auth', 'delete'> = (...[, response]) => {
    response.clearCookie(KEY_COOKIE_JWT, {
      httpOnly: true,
      secure: isNodeEnvProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response.send({ jwt: null });
  };

  constructor() {
    super();

    this.router.post('/auth', cookieAuth, this.login);
    this.router.delete('/auth', cookieAuth, this.logout);
  }
}
