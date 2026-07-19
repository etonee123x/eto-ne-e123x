import Express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middlewares/errorHandler';
import { send404 } from '@/middlewares/send404';
import { nonNullable } from '@/utils/nonNullable';
import { isNodeEnvDevelopment } from '@/constants/nodeEnv';
import { router } from '@/router';

export const app = Express() //
  .use((request, response, next)=>{
    console.log(`Request: ${request.method} ${request.url}`);
    next();
  })
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
