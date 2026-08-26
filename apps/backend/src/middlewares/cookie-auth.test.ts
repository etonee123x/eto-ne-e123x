import Express from 'express';
import cookieParser from 'cookie-parser';
import jsonWebToken from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { cookieAuth } from '@/middlewares/cookie-auth';
import { errorHandler } from '@/middlewares/error-handler';

const buildApp = () => {
  const app = Express();

  app.use(cookieParser());

  app.get('/protected', cookieAuth, (request_, response) => {
    response.status(200).json({ jwt: request_.cookies[KEY_COOKIE_JWT] ?? null });
  });

  app.use(errorHandler);

  return app;
};

const signJwt = () => {
  return jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn: '1h' });
};

describe('cookieAuth', () => {
  const previousSecretKey = process.env.SECRET_KEY;

  beforeEach(() => {
    process.env.SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    process.env.SECRET_KEY = previousSecretKey;
  });

  it('returns 401 when jwt is missing', async () => {
    const app = buildApp();

    const response = await request(app).get('/protected').expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('passes request when jwt cookie is valid', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app)
      .get('/protected')
      .set('Cookie', [`${KEY_COOKIE_JWT}=${jwt}`])
      .expect(200);

    expect(response.body).toEqual({ jwt });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('accepts jwt from query when cookie is absent', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app).get(`/protected?jwt=${jwt}`).expect(200);

    expect(response.body).toEqual({ jwt });
  });

  it('returns 401 when jwt is invalid', async () => {
    const app = buildApp();

    const response = await request(app)
      .get('/protected')
      .set('Cookie', [`${KEY_COOKIE_JWT}=broken-token`])
      .expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
