# Frontend Documentation

## Overview

Frontend is a Vue 3 + TypeScript SSR application with Express runtime.

Main features:

- SSR + hydration
- internationalization support
- dynamic content rendering
- API-driven UI state management
- media-aware client experience

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
- `npm run generate:openapi` - regenerate frontend API types from contracts

## Application Architecture

### SSR Flow

Server entry:

- creates Express app
- in development, mounts Vite middleware mode
- renders HTML for application routes
- injects dehydrated Vue Query cache and player state into HTML

Client entry:

- recreates app
- hydrates Vue Query cache from `window.__QUERY__`
- resolves locale from route/cookie
- mounts app with hydration

### API Client

The app uses an OpenAPI path-based API client.

Base URL strategy:

- client-side: `import.meta.env.VITE_API_PREFIX`
- server-side development: `SERVER_ORIGIN`
- server-side production/test: `INTERNAL_API_URL`

Requests use `credentials: include`.

### Development Proxy

In development, Vite proxies client requests to backend services.

Proxy also attaches Authorization header built from `BASIC_USER:BASIC_PASSWORD`.

## Routing And Localization

Global server behavior:

- if request path matches app route without locale prefix, server redirects to locale-prefixed URL
- locale is taken from `language` cookie or Negotiator fallback
- cookie `language` is persisted for one year

## Auth Integration

Behavior in SSR server:

- if request contains auth-related query data, frontend performs backend auth synchronization
- backend response cookies are forwarded to browser
- user is redirected to a normalized URL

Auth state for UI is derived from cookie-backed authentication data.

## Data Layer

TanStack Query is configured with:

- `retry: false`
- `staleTime: Infinity`
- `throwOnError: true`

Key data contexts manage list queries, mutations, and media synchronization.

## SEO

Unhead is used on both server and client.

- canonical host plugin is enabled
- title template and Open Graph tags are configured in the app
- SSR injects head tags into HTML template

## Additional Notes

- Internal route definitions, page-level mappings, and source file map are intentionally omitted from this document.