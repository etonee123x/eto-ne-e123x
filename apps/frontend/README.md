# Frontend

Next.js frontend для проекта `eto-ne-e123x`.

Полная документация проекта находится в корневом [README.md](../../README.md).

## Быстрый старт

```sh
cp .env.dev.example .env.local
npm install
npm run dev
```

Приложение откроется на `http://localhost:3000`.

Для локального API укажи в `.env.local`:

```dotenv
SERVER_ORIGIN=http://localhost:4000
```

## Команды

```sh
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run generate:openapi
```

## Основные каталоги

- `src/app/[locale]` — App Router routes and layouts;
- `src/entities` — business entities;
- `src/features` — user scenarios;
- `src/widgets` — composite page blocks;
- `src/shared` — reusable UI and utilities;
- `src/i18n` — routing and locale messages.
