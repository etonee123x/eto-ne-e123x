import Express from 'express';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

export class AuthModule {
  private authController: AuthController;

  constructor() {
    const authService = new AuthService();

    this.authController = new AuthController({ authService });
  }

  init(router: Express.Router) {
    router.use(this.authController.router);
  }
}
