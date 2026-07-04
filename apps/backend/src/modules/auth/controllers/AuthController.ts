import { cookieAuth } from '@/middlewares/cookieAuth';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import { AppError } from '@/shared/errors/AppError';
import { Controller } from '@/shared/Controller';

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
    response.clearCookie(KEY_COOKIE_JWT);

    return response.send({ jwt: null });
  };

  constructor() {
    super();

    this.router.post('/auth', cookieAuth, this.login);
    this.router.delete('/auth', cookieAuth, this.logout);
  }
}
