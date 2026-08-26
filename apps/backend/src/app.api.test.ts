import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app';

describe('API smoke', () => {
  it('returns 404 for unknown route', async () => {
    const app = createApp();

    await request(app).get('/__unknown-route').expect(404);
  });

  it('returns 400 when required query is missing', async () => {
    const app = createApp();

    const response = await request(app).get('/folder-data').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
  });

  it('sets security headers via helmet', async () => {
    const app = createApp();

    const response = await request(app).get('/__unknown-route');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects JSON payloads exceeding size limit', async () => {
    const previousLimit = process.env.JSON_BODY_LIMIT;
    process.env.JSON_BODY_LIMIT = '100b';

    const app = createApp();
    const largeObject = { text: 'x'.repeat(200) };

    const response = await request(app).post('/auth').send(largeObject).expect(413);

    expect(response.body).toMatchObject({ statusCode: 413 });

    process.env.JSON_BODY_LIMIT = previousLimit;
  });
});
