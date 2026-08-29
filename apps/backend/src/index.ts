import 'dotenv/config';

import http from 'node:http';

import { logger } from '@/shared/logger';
import { createApp } from '@/app';
import { pool } from '@/infrastructure/pool';
import { appConfig } from '@/config/app-config';

const app = createApp();

const server = http.createServer(app);
server.requestTimeout = appConfig.requestTimeoutMs;
server.headersTimeout = appConfig.headersTimeoutMs;
server.keepAliveTimeout = appConfig.keepAliveTimeoutMs;

server
  .once('listening', () => {
    logger.log(`HTTP server is listening on http://127.0.0.1:${appConfig.port}`);
  })
  .listen(appConfig.port)
  .on('error', (error) => {
    logger.error(`Failed to start HTTP server due to: ${error.message}`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });

let isShuttingDown = false;

const closePoolAndExit = async () => {
  try {
    await pool.end();
    logger.log('PostgreSQL pool closed successfully.');
  } catch (poolError) {
    const message = poolError instanceof Error ? poolError.message : String(poolError);
    logger.error(`Error closing PostgreSQL pool: ${message}`);
  }
};

const shutdown = (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  // eslint-disable-next-line unicorn/no-top-level-assignment-in-function
  isShuttingDown = true;

  logger.log(`Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit...');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }, 10_000);

  server.close(async () => {
    logger.log('HTTP server closed successfully.');

    try {
      await closePoolAndExit();
      clearTimeout(forceExitTimeout);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    } catch (closeError: unknown) {
      clearTimeout(forceExitTimeout);
      const message = closeError instanceof Error ? closeError.message : String(closeError);
      logger.error(`Unexpected shutdown error: ${message}`);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
