import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import type { ViteDevServer } from 'vite';
import cookieParser from 'cookie-parser';
import { transformHtmlTemplate } from '@unhead/vue/server';
import { resolve } from 'path';
import { pick } from '@etonee123x/shared/utils/pick';
import { postAuth } from '@/api/auth';
import { isProduction } from '@/constants/mode';
import { KEY_JWT } from '@/constants/keys';
import http from 'http';
import { type Locals, type RequestWithLocals } from '@/types';
import { requestToOrigin } from '@/utils/requestToOrigin';
import { isNil } from '@etonee123x/shared/utils/isNil';
import type { ExpressContext } from '@/constants/injectionKeyExpressContext.js';
import { throwError } from '@etonee123x/shared/utils/throwError';

// Constants
const port = process.env.PORT ?? throwError('PORT is not defined');
const BASE = '/';

// Cached production assets
const templateHtml = isProduction ? await readFile('./dist/client/index.html', 'utf-8') : '';

const renderHTML = async (url: string, expressContext: ExpressContext) => {
  const template = isProduction
    ? templateHtml
    : await vite.transformIndexHtml(url, await readFile('index.html', 'utf-8'));

  const { render } = isProduction
    ? await import('../dist/server/entryServer.js')
    : await vite.ssrLoadModule('./src/entryServer.ts');

  const rendered = await render(url, expressContext);

  return transformHtmlTemplate(
    rendered.head,
    template
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace('<!--app-teleport-->', rendered.teleports['#teleported'] ?? ''),
  );
};

// Create http server
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(cookieParser());

let vite: ViteDevServer;

if (isProduction) {
  const compression = (await import('compression')).default;
  const helmet = (await import('helmet')).default;

  app.use(helmet());
  app.use(compression());
} else {
  const { createServer } = await import('vite');

  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', base: BASE });
  app.use(vite.middlewares);

  app.use((request, response, next) => {
    if (request.originalUrl.startsWith('/.well-known/')) {
      response.status(404).send('Not Found');

      return;
    }

    next();
  });
}

app.get('/healthz', (...[, response]) => void response.send('ok'));

const auth: RequestHandler = async (request, response, next) => {
  const maybeQueryJwt = request.query[KEY_JWT]?.toString();

  if (isNil(maybeQueryJwt)) {
    return next();
  }

  await postAuth(maybeQueryJwt)
    .then((cookies) => {
      const isHttps = (request.headers['x-forwarded-proto'] ?? '').toString().startsWith('https');

      response.setHeader(
        'Set-Cookie',
        cookies.map((c) => `${c}; ${isHttps ? 'Secure' : ''}; SameSite=Lax`),
      );
    })
    .catch(() => response.clearCookie(KEY_JWT));

  const requestUrl = new URL(request.url, requestToOrigin(request));

  requestUrl.searchParams.delete(KEY_JWT);

  return response.redirect(requestUrl.toString());
};

const settings: RequestHandler = async (request: RequestWithLocals, response, next) => {
  const initialSettings = JSON.parse(await readFile(resolve('./public/settings.json'), 'utf-8'));

  const settings = {
    ...initialSettings,
    ...pick(request.cookies, ['themeColor', 'language']),
  };

  const locals: Locals = {
    settings,
  };

  const isHttps = (request.headers['x-forwarded-proto'] ?? '').toString().startsWith('https');

  response.cookie('language', settings.language, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: isHttps,
  });

  response.cookie('themeColor', settings.themeColor, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: isHttps,
  });

  request.locals = locals;

  next();
};

const main: RequestHandler = async (request: RequestWithLocals, response, next) => {
  renderHTML(request.originalUrl.replace(BASE, ''), { request, response, next })
    .then((html) => {
      if (response.headersSent) {
        return;
      }

      response
        .status(response.statusCode || 200)
        .set({ 'Content-Type': 'text/html' })
        .send(html);
    })
    .catch(next);
};

const error: ErrorRequestHandler = async (error, request, response, next) => {
  if (error instanceof Error) {
    vite?.ssrFixStacktrace(error);

    console.error('Unknown error', error);
  }

  renderHTML('404', { request, response, next }).then((html) =>
    response
      .status(response.statusCode || 500)
      .set({ 'Content-Type': 'text/html' })
      .send(html),
  );
};

app.use('*all', auth, settings, main, error);

http
  .createServer(app)
  .once('listening', () => console.info(`HTTP server is listening on http://127.0.0.1:${port}`))
  .listen(port)
  .on('error', (error) => console.error('Failed to start HTTP server due to:', error));
