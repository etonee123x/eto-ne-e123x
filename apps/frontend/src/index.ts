import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import express from 'express';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ViteDevServer } from 'vite';
import cookieParser from 'cookie-parser';
import { transformHtmlTemplate } from '@unhead/vue/server';
import { isProduction } from '@/constants/mode';
import { KEY_JWT } from '@/constants/keys';
import http from 'node:http';
import { requestToOrigin } from '@/utils/requestToOrigin';
import type { ExpressContext } from '@/types/ExpressContext';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { LOCALES_INFO } from '@/constants/localesInfo';
import { isKnownLocale } from '@/helpers/isKnownLocale';
import Negotiator from 'negotiator';
import { propertyCurried } from '@etonee123x/shared/utils/property';
import { ROUTE_NAME_TO_PATH } from '@/router';
import { nonNullable } from '@/utils/nonNullable';
import { client } from '@/api/client';

const port = process.env.PORT ?? throwError('PORT is not defined');
const BASE = '/';

const templateHtml = isProduction ? await readFile('./dist/client/index.html', 'utf8') : '';

const renderHTML = async (url: string, expressContext: ExpressContext) => {
  const template = isProduction
    ? templateHtml
    : await nonNullable(vite).transformIndexHtml(url, await readFile('index.html', 'utf8'));

  const { render } = isProduction
    ? await import('../dist/server/entryServer.js')
    : await nonNullable(vite).ssrLoadModule('./src/entryServer.ts');

  const rendered = await render(url, expressContext);

  return transformHtmlTemplate(
    rendered.head,
    template
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace('<!--app-teleport-->', rendered.teleports['#teleported'] ?? ''),
  );
};

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(cookieParser());

let vite: ViteDevServer | null = null;

if (isProduction) {
  const { default: compression } = await import('compression');

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

app.get('/healthz', (...[, response]) => {
  return response.send('ok');
});

app.use((request, response, next) => {
  if (
    !Object.values(ROUTE_NAME_TO_PATH).some((routePath) => {
      return new RegExp(String.raw`^/${routePath}(/|$|\?)`).test(request.path);
    })
  ) {
    next();
    return;
  }

  if (!isKnownLocale(request.cookies.language)) {
    const negotiatorLanguage = new Negotiator(request).language(LOCALES_INFO.map(propertyCurried('locale')));

    request.cookies.language = isKnownLocale(negotiatorLanguage) ? negotiatorLanguage : 'en';

    response.cookie('language', request.cookies.language, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  response.redirect(301, `${request.cookies.language}${request.originalUrl}`);
});

const syncLocaleCookie: RequestHandler = (request, response, next) => {
  const routeLanguage = /\w+/.exec(request.originalUrl)?.[0];

  if (isKnownLocale(routeLanguage)) {
    request.cookies.language = routeLanguage;
    response.cookie('language', routeLanguage, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  next();
};

const auth: RequestHandler = async (request, response, next) => {
  const maybeQueryJwt = request.query[KEY_JWT];

  if (typeof maybeQueryJwt !== 'string') {
    next();
    return;
  }

  await client['/auth']
    .POST({ params: { query: { jwt: maybeQueryJwt } } })
    .then((_response) => {
      const isHttps = (request.headers['x-forwarded-proto'] ?? '').toString().startsWith('https');

      response.setHeader(
        'Set-Cookie',
        _response.response.headers.getSetCookie().map((cookie) => {
          return `${cookie}; ${isHttps ? 'Secure' : ''}; SameSite=Lax`;
        }),
      );
    })
    .catch(() => {
      return response.clearCookie(KEY_JWT);
    });

  const requestUrl = new URL(request.url, requestToOrigin(request));

  requestUrl.searchParams.delete(KEY_JWT);

  response.redirect(303, requestUrl.toString());
};

const main: RequestHandler = async (request, response, next) => {
  return renderHTML(request.originalUrl.replace(BASE, ''), { request, response, next })
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

  renderHTML('404', { request, response, next }).then((html) => {
    return response
      .status(response.statusCode || 500)
      .set({ 'Content-Type': 'text/html' })
      .send(html);
  });
};

app.use('*all', syncLocaleCookie, auth, main, error);

http
  .createServer(app)
  .once('listening', () => {
    console.info(`HTTP server is listening on http://127.0.0.1:${port}`);
  })
  .listen(port)
  .on('error', (error) => {
    console.error('Failed to start HTTP server due to:', error);
  });
