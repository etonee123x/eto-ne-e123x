import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app';
import { appConfig } from '@/config/app-config';

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

  it('sets CORS headers for allowed origin', async () => {
    const app = createApp();

    const response = await request(app).get('/health/live').set('Origin', 'http://localhost:3000').expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('rejects JSON payloads exceeding size limit', async () => {
    const previousLimit = appConfig.jsonBodyLimit;
    (appConfig as unknown as { jsonBodyLimit: string }).jsonBodyLimit = '100b';

    const app = createApp();
    const largeObject = { text: 'x'.repeat(200) };

    const response = await request(app).post('/auth').send(largeObject).expect(413);

    expect(response.body).toMatchObject({ statusCode: 413 });

    (appConfig as unknown as { jsonBodyLimit: string }).jsonBodyLimit = previousLimit;
  });
});
