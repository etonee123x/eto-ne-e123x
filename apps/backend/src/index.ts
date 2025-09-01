import 'dotenv/config';

import http from 'http';

import { app } from '@/app';
import { logger } from '@/helpers/logger';

http
  .createServer(app)
  .once('listening', () => logger(`HTTP server is listening on http://127.0.0.1:${process.env.PORT}`))
  .listen(process.env.PORT)
  .on('error', (error) => logger.error('Failed to start HTTP server due to:', error));
