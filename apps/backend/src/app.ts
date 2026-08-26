import Express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from '@/middlewares/error-handler.middleware';
import { send404 } from '@/middlewares/send-404.middleware';
import { nonNullable } from '@/utils/non-nullable';
import { isNodeEnvDevelopment } from '@/constants/node-env';

import { PostsModule } from '@/modules/posts/posts.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { FolderDataModule } from '@/modules/folder-data/folder-data.module';
import { HealthModule } from '@/modules/health/health.module';

export const createApp = () => {
  const router = Express.Router();

  for (const module of [new PostsModule(), new AuthModule(), new FolderDataModule(), new HealthModule()]) {
    module.init(router);
  }

  const jsonLimit = process.env.JSON_BODY_LIMIT ?? '1mb';
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => {
        return origin.trim();
      })
    : ['http://localhost:3000'];

  const app = Express() //
    .use(helmet())
    .use(
      cors({
        origin: corsOrigins,
        credentials: true,
      }),
    )
    .use(cookieParser())
    .use(Express.json({ limit: jsonLimit }));

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
