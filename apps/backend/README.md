# Backend Documentation

## Overview

This backend is an Express 5 + TypeScript service that provides:

- authentication and access control
- content and entity management APIs
- server-side processing for uploaded and local assets

OpenAPI source files live in `apps/openApi/openapi`.

## Tech Stack

- Node.js
- Express 5
- TypeScript
- multer (uploads)
- jsonwebtoken (auth validation)
- file-type, sharp, music-metadata, ffprobe-static (file metadata)

## Local Run

From `apps/backend`:

```bash
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://127.0.0.1:<PORT>`.

## Environment Variables

Required variables (see `.env.example`):

- `PORT` - HTTP port
- `SECRET_KEY` - JWT verification key
- `DATABASE_PATH` - directory for JSON table files (example: `../../infra/database`)
- `CONTENT_PATH` - root directory for local content (example: `../../infra/content`)
- `UPLOADS_PATH` - directory for uploaded attachments (example: `../../infra/uploads`)

Notes:

- In development, static routes are enabled:
  - `/content` -> `CONTENT_PATH`
  - `/uploads` -> `UPLOADS_PATH`

## NPM Scripts

- `npm run dev` - run in development with watcher
- `npm run start` - run in production mode
- `npm run typecheck` - TypeScript check
- `npm run lint` - lint
- `npm run lint:fix` - lint with autofix
- `npm run dev:generateAuthUrl` - helper utility for local auth flow testing
- `npm run generate:openapi` - regenerate backend API types from contracts

## API Notes

This service exposes authenticated and public REST APIs.

Detailed endpoint definitions are intentionally omitted from this README.

Use the shared contracts package for interface-level details.

## Storage Details

- Runtime data is stored under paths configured in environment variables.
- Uploaded assets are written to the configured upload directory.

## Error Handling

- HTTP errors created with `http-errors` are returned with their status code and JSON payload.
- Unknown errors return `500` with body:

```json
{ "message": "Something went wrong :(" }
```

## Additional Notes

- Internal route, schema, and storage implementation details are intentionally not listed in this document.