import Express from 'express';
import { AuthController } from './controllers/auth.controller';

export class AuthModule {
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
  }

  init(router: Express.Router) {
    router.use(this.authController.router);
  }
}
