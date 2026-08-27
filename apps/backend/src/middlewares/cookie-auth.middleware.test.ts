import Express from 'express';
import cookieParser from 'cookie-parser';
import jsonWebToken from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { cookieAuth } from '@/middlewares/cookie-auth.middleware';
import { errorHandler } from '@/middlewares/error-handler.middleware';

const buildApp = () => {
  const app = Express();

  app.use(cookieParser());

  app.get('/protected', cookieAuth, (...[, response]) => {
    response.status(200).json({ ok: true });
  });

  app.use(errorHandler);

  return app;
};

const signJwt = () => {
  return jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn: '1h' });
};

describe('cookieAuth', () => {
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

    expect(response.body).toEqual({ ok: true });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('rejects jwt from query and returns 401', async () => {
    const app = buildApp();
    const jwt = signJwt();

    const response = await request(app).get(`/protected?jwt=${jwt}`).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401 });
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
