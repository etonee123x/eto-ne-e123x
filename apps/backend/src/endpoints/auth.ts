import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import { cookieAuth } from '@/middlewares/cookieAuth';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import Express from 'express';

export const createAuth: RequestHandlerTyped<'/auth', 'post'> = (request, response) => {
  return response.send({
    jwt: request.cookies[KEY_COOKIE_JWT],
  });
};

export const deleteAuth: RequestHandlerTyped<'/auth', 'delete'> = (...[, response]) => {
  return response.clearCookie(KEY_COOKIE_JWT).send({
    jwt: null,
  });
};

export const router = Express.Router();

router.post('/auth', cookieAuth, createAuth);
router.delete('/auth', cookieAuth, deleteAuth);
