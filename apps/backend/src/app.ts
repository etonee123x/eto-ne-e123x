import express from 'express';
import cookieParser from 'cookie-parser';

import { router } from '@/router';
import { logger, errorHandler, send404 } from '@/middleware';

export const app = express()
  .use(cookieParser())
  .use(express.json())
  .use(logger)
  .use(router)
  .use(errorHandler)
  .use(send404);
