# Backend

Backend проекта `etonee123x` — это Express API, который обслуживает публичный frontend, управляет auth, публикует посты и отдаёт содержимое из `infra/content` и `infra/uploads`.

Полная карта проекта находится в корневом [README.md](../../README.md).

## Стек

- Node.js + TypeScript
- Express 5
- PostgreSQL driver (`pg`) для возможного persistence слоя
- `multer` для multipart uploads
- `jsonwebtoken` для JWT
- `cookie-parser` для cookie auth
- `music-metadata`, `sharp`, `file-type`, `ffprobe-static` для media-inspection
- Vitest для тестов

## Быстрый старт

```sh
cd apps/backend
cp .env.example .env
npm install
npm run dev
```

API запускается на `http://localhost:4000` при `PORT=4000`.

## Структура backend

```text
src/
  app.ts                 базовый express app + регистрацию модулей
  index.ts               запуск HTTP server
  constants/             константы окружения, cookie keys
  infrastructure/        storage, database wrappers, file inspectors
  middlewares/           auth middleware, error handling, multipart parsing
  modules/               доменные модули: auth, posts, folder-data
  shared/                базовые controller/module/logger/errors/types
  types/                 generated OpenAPI types
  utils/                 helpers
```

## Основные модули

### `modules/auth`

- `AuthController` обрабатывает `POST /auth` и `DELETE /auth`
- `cookie-auth.middleware.ts` валидирует JWT из cookies
- auth используется для защиты endpoint-ов, которым нужен авторизованный пользователь

### `modules/posts`

- `PostsController` работает с `GET /posts`, `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`
- `PostsService` выполняет бизнес-логику публикаций и загрузки attachments
- `FilesService` управляет upload/cleanup файлов
- `*FileInspector` определяет тип файла и собирает metadata
- `FsDatabaseFile` и репозитории хранят посты в JSON

### `modules/folder-data`

- `FolderDataController` работает с `GET /folder-data?path=...`
- `FolderDataService` читает файлы и каталог внутри `CONTENT_PATH`
- используется для файлового explorer и отдачи контента frontend-ом

## Как проходит запрос

Типичный запрос выглядит так:

```text
index.ts
  -> createApp()
  -> app.ts
  -> module.init(router)
  -> controller
  -> service
  -> repository / storage / file inspector
  -> response JSON
```

Пример:

```text
multipart upload
  -> parseFiles middleware
  -> PostsController.createPost
  -> PostsService.createPost
  -> FilesService.upload
  -> FsFilesStorage.put
  -> fileInspector.inspect
  -> posts repo сохраняет запись в JSON database
```

## Конфигурация окружения

Основные переменные:

- `PORT` — порт сервера
- `SECRET_KEY` — ключ для JWT
- `DATABASE_PATH` — путь к runtime-данным
- `CONTENT_PATH` — каталог с медиа-контентом
- `UPLOADS_PATH` — каталог загруженных пользователем файлов

Файл шаблона: `.env.example`.

## Важные директории

- `infra/content` — публичные изображения, музыка и другие файлы
- `infra/uploads` — загруженные пользователем файлы
- `infra/database/posts.json` — runtime storage для постов

## Команды

```sh
npm run dev
npm run start
npm run test
npm run test:watch
npm run typecheck
npm run lint
npm run lint:fix
npm run generate:openapi
```

## OpenAPI

API-контракт лежит в `../openApi/openapi/openapi.yaml`, а сгенерированные типы формируются в `src/types/openapi.ts`.

Это позволяет держать frontend и backend в синхронизации по структуре запросов/ответов.
