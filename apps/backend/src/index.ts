import 'dotenv/config';

import http from 'node:http';

import Express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middlewares/errorHandler';
import { send404 } from '@/middlewares/send404';
import { nonNullable } from '@/utils/nonNullable';
import { isNodeEnvDevelopment } from '@/constants/nodeEnv';
import { logger } from '@/shared/logger';

import { PostsModule } from '@/modules/posts/PostsModule';
import { AuthModule } from '@/modules/auth/AuthModule';
import { FolderDataModule } from '@/modules/folderData/FolderDataModule';

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

app //
  .use(router)
  .use(errorHandler)
  .use(send404);

http
  .createServer(app)
  .once('listening', () => {
    logger.log(`HTTP server is listening on http://127.0.0.1:${process.env.PORT}`);
  })
  .listen(process.env.PORT)
  .on('error', (error) => {
    logger.error(`Failed to start HTTP server due to: ${error.message}`);
  });
