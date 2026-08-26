import Express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middlewares/error-handler.middleware';
import { send404 } from '@/middlewares/send-404.middleware';
import { nonNullable } from '@/utils/non-nullable';
import { isNodeEnvDevelopment } from '@/constants/node-env';

import { PostsModule } from '@/modules/posts/posts.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { FolderDataModule } from '@/modules/folder-data/folder-data.module';

export const createApp = () => {
  const router = Express.Router();

  for (const module of [new PostsModule(), new AuthModule(), new FolderDataModule()]) {
    module.init(router);
  }

  const app = Express() //
    .use(cookieParser())
    .use(Express.json());

  if (isNodeEnvDevelopment) {
    app
      .use('/content', Express.static(nonNullable(process.env.CONTENT_PATH)))
      .use('/uploads', Express.static(nonNullable(process.env.UPLOADS_PATH)));
  }

  return app //
    .use(router)
    .use(errorHandler)
    .use(send404);
};
