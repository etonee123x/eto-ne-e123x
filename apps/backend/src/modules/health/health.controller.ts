import Express from 'express';
import { Controller } from '@/shared/controller';

export class HealthController extends Controller {
  private live: Express.RequestHandler = (...[, response]) => {
    return response.status(200).json({ status: 'ok' });
  };

  private ready: Express.RequestHandler = (...[, response]) => {
    return response.status(200).json({ status: 'ready' });
  };

  constructor() {
    super();

    this.router.get('/health/live', this.live);
    this.router.get('/health/ready', this.ready);
  }
}
