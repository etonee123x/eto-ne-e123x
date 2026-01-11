import Express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middlewares/errorHandler';
import { send404 } from '@/middlewares/send404';
import { OpenAPIBackend } from 'openapi-backend';
import type { Request } from 'openapi-backend';
import { createAuth, deleteAuth } from '@/endpoints/auth';
import { getFolderData } from '@/endpoints/folderData';
import { getPosts, createPost, getPostById, updatePostById, deletePostById } from '@/endpoints/posts';
import type { OperationHandler, Operations } from '@/types/openapi';
import { cookieAuth } from '@/middlewares/cookieAuth';
import { nonNullable } from '@/utils/nonNullable';
import { isNodeEnvDevelopment } from '@/constants/nodeEnv';
import bodyParser from 'body-parser';

const api = new OpenAPIBackend({
  definition: '../openApi/dist/openapi.yaml',
  coerceTypes: true,
  handlers: {
    createAuth,
    deleteAuth,
    getFolderData,
    getPosts,
    createPost,
    getPostById,
    updatePostById,
    deletePostById,
  } satisfies {
    [Operation in keyof Operations]: OperationHandler<Operation, [Express.Request, Express.Response]>;
  },
  securityHandlers: {
    cookieAuth,
  },
});

api.init();

export const app = Express() //
  .use(cookieParser())
  .use(Express.json());

if (isNodeEnvDevelopment) {
  app
    .use('/content', Express.static(nonNullable(process.env.CONTENT_PATH)))
    .use('/uploads', Express.static(nonNullable(process.env.UPLOADS_PATH)));
}

app
  .use((request, response) => {
    return api.handleRequest(request as Request, request, response);
  })
  .use(errorHandler)
  .use(send404);
