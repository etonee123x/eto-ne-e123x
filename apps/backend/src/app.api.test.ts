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
});
