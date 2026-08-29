import Express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

const buildApp = () => {
  const app = Express();
  const controller = new HealthController();
  app.use(controller.router);
  return app;
};

describe('HealthController', () => {
  it('returns 200 ok for liveness probe', async () => {
    const app = buildApp();
    const response = await request(app).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns 200 ready for readiness probe', async () => {
    const app = buildApp();
    const response = await request(app).get('/health/ready').expect(200);
    expect(response.body).toEqual({ status: 'ready' });
  });
});
