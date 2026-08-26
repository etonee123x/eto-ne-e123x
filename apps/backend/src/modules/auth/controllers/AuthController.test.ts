import Express from 'express';
import cookieParser from 'cookie-parser';
import jsonWebToken from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import { errorHandler } from '@/middlewares/errorHandler';
import { AuthController } from '@/modules/auth/controllers/AuthController';

const buildApp = () => {
  const app = Express();

  app.use(cookieParser());

  const controller = new AuthController();
  app.use(controller.router);
  app.use(errorHandler);

  return app;
};

const signJwt = () => {
  return jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn: '1h' });
};

describe('AuthController', () => {
  const previousSecretKey = process.env.SECRET_KEY;

  beforeEach(() => {
    process.env.SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    process.env.SECRET_KEY = previousSecretKey;
  });

  it('returns 401 when jwt is missing', async () => {
    const app = buildApp();

    const response = await request(app).post('/auth').expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns 401 when jwt is invalid', async () => {
    const app = buildApp();

    const response = await request(app)
      .post('/auth')
      .set('Cookie', [`${KEY_COOKIE_JWT}=broken-token`])
      .expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns jwt on successful login', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app)
      .post('/auth')
      .set('Cookie', [`${KEY_COOKIE_JWT}=${jwt}`])
      .expect(200);

    expect(response.body).toEqual({ jwt });
  });

  it('clears cookie and returns null jwt on logout', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app)
      .delete('/auth')
      .set('Cookie', [`${KEY_COOKIE_JWT}=${jwt}`])
      .expect(200);

    expect(response.body).toEqual({ jwt: null });
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
