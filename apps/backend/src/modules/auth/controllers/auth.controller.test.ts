import Express from 'express';
import cookieParser from 'cookie-parser';
import jsonWebToken from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { errorHandler } from '@/middlewares/error-handler.middleware';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';

const buildApp = () => {
  const app = Express();

  app.use(cookieParser());

  const controller = new AuthController({ authService: new AuthService() });
  app.use(controller.router);
  app.use(errorHandler);

  return app;
};

const signJwt = () => {
  return jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn: '5m' });
};

describe('AuthController', () => {
  const previousSecretKey = process.env.SECRET_KEY;

  beforeEach(() => {
    process.env.SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    process.env.SECRET_KEY = previousSecretKey;
  });

  it('returns 400 when jwt is missing', async () => {
    const app = buildApp();

    const response = await request(app).post('/auth').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
  });

  it('returns 401 when jwt is invalid', async () => {
    const app = buildApp();

    const response = await request(app).post('/auth').query({ jwt: 'broken-token' }).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns 401 when jwt expires after ten minutes', async () => {
    const app = buildApp();
    const jwt = jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn: '11m' });

    const response = await request(app).post('/auth').query({ jwt }).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns 401 when jwt is older than ten minutes', async () => {
    const app = buildApp();
    const now = Math.floor(Date.now() / 1000);
    const jwt = jsonWebToken.sign(
      { role: 'admin', iat: now - 11 * 60, exp: now + 60 },
      String(process.env.SECRET_KEY),
      { noTimestamp: true },
    );

    const response = await request(app).post('/auth').query({ jwt }).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns 401 when jwt has no issued-at time', async () => {
    const app = buildApp();
    const jwt = jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), {
      expiresIn: '5m',
      noTimestamp: true,
    });

    const response = await request(app).post('/auth').query({ jwt }).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
  });

  it('returns jwt on successful login', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app).post('/auth').query({ jwt }).expect(200);

    expect(response.body).toEqual({ jwt });
    expect(response.headers['set-cookie']).toBeDefined();
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
