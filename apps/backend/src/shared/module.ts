import Express from 'express';
import type { Controller } from '@/shared/controller';

export class Module {
  private readonly controller: Controller;

  constructor(parameters: { controller: Controller }) {
    this.controller = parameters.controller;
  }

  init(router: Express.Router) {
    router.use(this.controller.router);
  }
}
