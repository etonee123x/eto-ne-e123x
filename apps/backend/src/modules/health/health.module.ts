import { HealthController } from './health.controller';
import { Module } from '@/shared/module';

export class HealthModule extends Module {
  constructor() {
    super({ controller: new HealthController() });
  }
}
