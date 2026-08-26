import Express from 'express';
import request from 'supertest';
import { describe, it } from 'vitest';

import { send404 } from '@/middlewares/send-404.middleware';

describe('send404', () => {
  it('sends 404 status for unknown route', async () => {
    const app = Express();

    app.use(send404);

    await request(app).get('/unknown-route').expect(404);
  });
});
