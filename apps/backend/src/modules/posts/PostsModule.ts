import { Module } from '@/shared/Module';
import { PostsController } from './controllers/PostsController';
import { PostsService } from './services/PostsService';
import { PostsRepo } from './repos/PostsRepo';

export class PostsModule extends Module {
  constructor() {
    const postsRepo = new PostsRepo();
    const postsService = new PostsService(postsRepo, files);
    const postsController = new PostsController(postsService);
    super(postsController);
  }
}
