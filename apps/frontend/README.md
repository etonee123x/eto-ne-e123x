# Frontend Documentation

## Overview

Frontend is a Vue 3 + TypeScript SSR application with Express runtime.

Main features:

- SSR + hydration
- i18n with locale in URL (`/ru`, `/en`)
- Content Explorer
- Blog with infinite pagination and admin post management
- Audio player integrated with explorer data

OpenAPI source files live in `apps/openApi/openapi`.

## Tech Stack

- Vue 3 (Composition API)
- Vue Router
- Vue I18n
- TanStack Vue Query
- Unhead (SEO)
- Vite (client + SSR builds)
- Tailwind CSS v4
- Express 5 (SSR server)
- openapi-fetch + generated OpenAPI types

## Local Run

From `apps/frontend`:

```bash
npm install
cp .env.dev.example .env
npm run dev
```

Server starts on `http://127.0.0.1:<PORT>`.

## Build And Start

```bash
npm run build
npm run start
```

- `build:client` writes client bundle to `dist/client`
- `build:server` writes SSR entry to `dist/server`

## Environment Variables

### Development (`.env.dev.example`)

- `PORT` - frontend server port
- `VITE_API_PREFIX` - API prefix on client (usually `/api`)
- `SERVER_ORIGIN` - backend origin used by dev proxy and server-side API calls in dev
- `APP_MODE=development`
- `BASIC_USER`, `BASIC_PASSWORD` - credentials used to build Authorization header in development

### Production/Test (`.env.prod.example`, `.env.test.example`)

- `PORT` - frontend server port
- `VITE_API_PREFIX` - API prefix on client
- `INTERNAL_API_URL` - internal backend URL for server-side API calls
- `APP_MODE=production|test`

## NPM Scripts

- `npm run dev` - start SSR server in development
- `npm run start` - start SSR server in production mode
- `npm run build` - build client and server bundles
- `npm run lint` - lint
- `npm run lint:fix` - lint with autofix
- `npm run typecheck` - Vue TypeScript checks
- `npm run generate:openapi` - regenerate `src/types/openapi.ts`

## Application Architecture

### SSR Flow

Server entry is `src/index.ts`:

- creates Express app
- in development, mounts Vite middleware mode
- for app routes, renders HTML using `src/entryServer.ts`
- injects dehydrated Vue Query cache and player state into HTML

Client entry is `src/entryClient.ts`:

- recreates app
- hydrates Vue Query cache from `window.__QUERY__`
- resolves locale from route/cookie
- mounts app with hydration

### API Client

`src/api/client.ts` uses OpenAPI path-based client.

Base URL strategy:

- client-side: `import.meta.env.VITE_API_PREFIX`
- server-side development: `SERVER_ORIGIN`
- server-side production/test: `INTERNAL_API_URL`

Requests use `credentials: include`.

### Development Proxy

In development (`vite.config.ts`), Vite proxies:

- `/api` -> backend origin (rewritten without `/api` prefix)
- `/uploads` -> backend origin
- `/content` -> backend origin

Proxy also attaches Authorization header built from `BASIC_USER:BASIC_PASSWORD`.

## Routing And Localization

Router config is in `src/plugins/router.ts`.

Main localized routes:

- `/:language(ru|en)`
- `/:language/explorer/:segments*`
- `/:language/blog`
- `/:language/blog/:postId`

Global behavior in server (`src/index.ts`):

- if request path matches app route without locale prefix, server redirects to locale-prefixed URL
- locale is taken from `language` cookie or Negotiator fallback
- cookie `language` is persisted for one year

## Auth Integration

JWT cookie key is `jwt`.

Behavior in SSR server:

- if request has `?jwt=...`, frontend calls backend `POST /auth`
- backend response cookies are forwarded to browser
- user is redirected to same URL without `jwt` query parameter

Auth state for UI is derived from JWT payload (`isAdmin`) in `src/contexts/auth.ts`.

## Data Layer

TanStack Query is configured in `src/main.ts` with:

- `retry: false`
- `staleTime: Infinity`
- `throwOnError: true`

Key data contexts:

- Blog context (`src/views/Blog/contexts/blog.ts`)
  - infinite query for posts
  - mutations for create/update/delete post
- Explorer context (`src/views/Explorer/contexts/explorer.ts`)
  - query for folder data
  - sync with audio player state

## SEO

Unhead is used both on server and client.

- canonical host plugin is enabled
- title template and Open Graph tags are set in app/views
- SSR injects head tags into HTML template

## Main UI Areas

- Home: `src/views/Index/ViewIndex.vue`
- Explorer: `src/views/Explorer/ViewExplorer.vue`
- Blog: `src/views/Blog/ViewBlog.vue`
- 404 page: `src/views/Page404/ViewPage404.vue`

## Useful Endpoints (Frontend Server)

- `GET /healthz` -> `ok`
- App requests are handled by catch-all SSR route (`*all`)

## Source Map

- SSR server: `src/index.ts`
- App factory: `src/main.ts`
- Client entry: `src/entryClient.ts`
- Server renderer: `src/entryServer.ts`
- Router: `src/plugins/router.ts`
- I18n: `src/plugins/i18n.ts`
- API client: `src/api/client.ts`
- Auth context: `src/contexts/auth.ts`