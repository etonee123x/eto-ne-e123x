import Express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/middlewares/cookieAuth', () => {
  return {
    cookieAuth: (...[, , next]: Parameters<Express.RequestHandler>) => {
      next();
    },
  };
});

import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import { errorHandler } from '@/middlewares/errorHandler';
import { AuthController } from '@/modules/auth/controllers/AuthController';

const buildApp = (parameters?: { forceNonStringCookie?: boolean }) => {
  const app = Express();

  app.use(cookieParser());

  if (parameters?.forceNonStringCookie) {
    app.use((...parameters_) => {
      const [request_, , next] = parameters_;
      request_.cookies[KEY_COOKIE_JWT] = { bad: true };
      next();
    });
  }

  const controller = new AuthController();
  app.use(controller.router);
  app.use(errorHandler);

  return app;
};

describe('AuthController', () => {
  it('returns 400 when jwt cookie is missing', async () => {
    const app = buildApp();

    const response = await request(app).post('/auth').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 when jwt is not a string', async () => {
    const app = buildApp({ forceNonStringCookie: true });

    const response = await request(app).post('/auth').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
  });

  it('returns jwt on successful login', async () => {
    const app = buildApp();

    const response = await request(app)
      .post('/auth')
      .set('Cookie', [`${KEY_COOKIE_JWT}=token-value`])
      .expect(200);

    expect(response.body).toEqual({ jwt: 'token-value' });
  });

  it('clears cookie and returns null jwt on logout', async () => {
    const app = buildApp();

    const response = await request(app).delete('/auth').expect(200);

    expect(response.body).toEqual({ jwt: null });
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
