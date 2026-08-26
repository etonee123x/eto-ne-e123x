import Express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middlewares/errorHandler';
import { send404 } from '@/middlewares/send404';
import { nonNullable } from '@/utils/nonNullable';
import { isNodeEnvDevelopment } from '@/constants/nodeEnv';

import { PostsModule } from '@/modules/posts/PostsModule';
import { AuthModule } from '@/modules/auth/AuthModule';
import { FolderDataModule } from '@/modules/folderData/FolderDataModule';

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
