# Backend Documentation

## Overview

This backend is an Express 5 + TypeScript service that provides:

- Auth via JWT stored in cookie named `jwt`
- Posts CRUD with file uploads (multipart/form-data)
- File/folder browsing under the configured content directory

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
- `CONTENT_PATH` - root directory for folder-data endpoint (example: `../../infra/content`)
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
- `npm run dev:generateAuthUrl` - print frontend URL containing a signed JWT query parameter
- `npm run generate:openapi` - regenerate `src/types/openapi.ts` from OpenAPI yaml

## Auth Model

Cookie key: `jwt`.

The `cookieAuth` middleware accepts token from:

- cookie `jwt`, or
- query parameter `jwt`

If verification passes:

- it refreshes the `jwt` cookie expiration using JWT `exp` (if present)
- it continues request handling

If verification fails:

- it clears the cookie
- returns `401 Unauthorized`

Important behavior:

- `POST /auth` does not mint a new JWT. It validates an existing token (cookie or query) and returns `{ jwt }`.

## API Endpoints

### Auth

#### POST /auth

Validate token and persist it in cookie.

- Auth required: yes (via `cookieAuth`)
- Token source: cookie `jwt` or query `jwt`
- Response `200`: `{ "jwt": "<token>" }`
- Response `401`: unauthorized

Example:

```bash
curl -i -X POST "http://127.0.0.1:4000/auth?jwt=<JWT>"
```

#### DELETE /auth

Clear auth cookie.

- Auth required: yes
- Response `200`: `{ "jwt": null }`
- Response `401`: unauthorized

Example:

```bash
curl -i -X DELETE "http://127.0.0.1:4000/auth" --cookie "jwt=<JWT>"
```

### Posts

#### GET /posts

Get paginated posts.

Query params:

- `pageSize` (default `10`)
- `filters[cursorPrevious]`
- `filters[cursorNext]`
- `filters[postId]`

Cursor behavior uses post `_meta.createdAt` values.

Responses:

- `200`: `{ _meta: { cursorPrevious, cursorNext }, rows: Post[] }`
- `400`: invalid cursor values
- `404`: when `filters[postId]` points to non-existing post

Examples:

```bash
curl "http://127.0.0.1:4000/posts?pageSize=10"
curl "http://127.0.0.1:4000/posts?filters[cursorNext]=1749111111111&pageSize=10"
curl "http://127.0.0.1:4000/posts?filters[postId]=<POST_ID>&pageSize=10"
```

#### POST /posts

Create post (multipart/form-data).

- Auth required: yes
- Body fields:
  - `text` (string)
  - `files` (array of files)
- File size limit: 50 MB per file

Response:

- `200`: created post object
- `401`: unauthorized

Example:

```bash
curl -X POST "http://127.0.0.1:4000/posts" \
  --cookie "jwt=<JWT>" \
  -F "text=Hello" \
  -F "files=@/absolute/path/image.jpg"
```

#### PATCH /posts/:id

Update post text and attachments (multipart/form-data).

- Auth required: yes
- Body fields:
  - `text` (string)
  - `attachments` (JSON array sent as string field in multipart)
  - `files` (array of new files)

`attachments` supports:

- existing attachment objects to keep
- `null` placeholders to replace with files from `files[]` in order

Any old attachment omitted from the resulting set is deleted from disk.

Responses:

- `200`: updated post
- `401`: unauthorized
- `404`: post not found

Example:

```bash
curl -X PATCH "http://127.0.0.1:4000/posts/<POST_ID>" \
  --cookie "jwt=<JWT>" \
  -F "text=Updated" \
  -F 'attachments=[null,{"name":"upload-old.jpg","ext":".jpg","fileType":"IMAGE","src":"/uploads/upload-old.jpg","path":"/uploads/upload-old.jpg","itemType":"FILE","metadata":{"width":100,"height":100},"_meta":{"createdAt":0,"updatedAt":0}}]' \
  -F "files=@/absolute/path/new-image.jpg"
```

#### DELETE /posts/:id

Delete post and all its attachments from disk.

- Auth required: yes
- Responses:
  - `200`: deleted post
  - `401`: unauthorized
  - `404`: post not found

Example:

```bash
curl -X DELETE "http://127.0.0.1:4000/posts/<POST_ID>" --cookie "jwt=<JWT>"
```

### Folder Data

#### GET /folder-data

Browse files/folders inside `CONTENT_PATH`.

Query params:

- `path` (defaults to `/` if omitted)

Responses:

- `200`: object with `folders`, `files`, optional `file`, and `pathDirectory`
- `404`: path not found

Notes:

- Entry named `.git` is excluded
- File entries include metadata inferred from file content:
  - audio: duration, bitrate, album, artists, bpm, year
  - image: width, height
  - video: width, height

Example:

```bash
curl "http://127.0.0.1:4000/folder-data?path=/"
curl "http://127.0.0.1:4000/folder-data?path=/music"
```

## Storage Details

- Posts are stored in JSON table file at:
  - `<DATABASE_PATH>/posts.json`
- Uploaded files are written to:
  - `<UPLOADS_PATH>/upload-<uuid>.<ext>`

## Error Handling

- HTTP errors created with `http-errors` are returned with their status code and JSON payload.
- Unknown errors return `500` with body:

```json
{ "message": "Something went wrong :(" }
```

## Source Map

- App wiring: `src/app.ts`, `src/index.ts`
- Router: `src/router/index.ts`
- Endpoints: `src/endpoints/*.ts`
- Auth middleware: `src/middlewares/cookieAuth.ts`
- Error middleware: `src/middlewares/errorHandler.ts`, `src/middlewares/send404.ts`
- Local JSON table adapter: `src/helpers/TableController.ts`