import 'dotenv/config';

import http from 'node:http';

import { logger } from '@/shared/logger';
import { createApp } from '@/app';

const app = createApp();

http
  .createServer(app)
  .once('listening', () => {
    logger.log(`HTTP server is listening on http://127.0.0.1:${process.env.PORT}`);
  })
  .listen(process.env.PORT)
  .on('error', (error) => {
    logger.error(`Failed to start HTTP server due to: ${error.message}`);
  });
