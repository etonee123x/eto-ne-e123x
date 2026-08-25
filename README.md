# eto-ne-e123x

Веб-приложение с публичным frontend на Next.js, API на Express и файловым контентом, который хранится в `infra`.

## Содержание

- [Структура](#структура)
- [Требования](#требования)
- [Установка](#установка)
- [Локальный запуск](#локальный-запуск)
- [Переменные окружения](#переменные-окружения)
- [Ответственность приложений](#ответственность-приложений)
- [Архитектура frontend](#архитектура-frontend)
- [API и OpenAPI](#api-и-openapi)
- [Проверки](#проверки)
- [Runtime-проверки в браузере](#runtime-проверки-в-браузере)
- [Работа с AI-агентами](#работа-с-ai-агентами)

## Структура

```text
apps/
  frontend/   Next.js, React, TypeScript, next-intl
  backend/    Express API, TypeScript
  openApi/    OpenAPI-документ и его валидация
infra/
  content/    изображения, музыка и другой публикуемый контент
  database/   runtime-данные, включая posts.json
  uploads/    загруженные пользователями файлы

AGENTS.md     общие инструкции для AI-кодинг-агентов
CLAUDE.md     совместимый entry point, ссылается на AGENTS.md
```

## Требования

- Node.js с npm.
- Доступ к GitHub для установки skills.

В корне нет общего `package.json`: зависимости устанавливаются отдельно в каждом приложении.

## Установка

После клонирования репозитория выполни:

```sh
cd apps/frontend && npm install
cd ../backend && npm install
cd ../openApi && npm install
```

Skills хранятся локально и исключены из Git. Установи их из корневого `skills-lock.json` командой из корня репозитория:

```sh
# из корня репозитория
npx skills experimental_install
```

Команда восстановит skills в `.agents/skills`. При запросе `npx` разреши установку пакета `skills`.

Проверить установленные skills можно так:

```sh
find .agents/skills -name SKILL.md -print
```

`agent-browser` устанавливается вместе с frontend как локальная dev-зависимость. Глобальная установка не нужна:

```sh
npx agent-browser --version
```

После установки можно переходить к настройке окружения и запуску приложений.

## Локальный запуск

### 1. Настроить backend

```sh
cd apps/backend
cp .env.example .env
```

Проверь значения `SECRET_KEY`, `DATABASE_PATH`, `CONTENT_PATH` и `UPLOADS_PATH` в `.env`. Пути из примера рассчитаны на запуск из `apps/backend`.

Запустить API:

```sh
npm run dev
```

API будет доступен на `http://localhost:4000`, если в `.env` указан `PORT=4000`.

### 2. Настроить frontend

Для разработки с тестовым сервером:

```sh
cd apps/frontend
cp .env.dev.example .env.local
npm run dev
```

Для полностью локального API в `apps/frontend/.env.local` замени:

```dotenv
SERVER_ORIGIN=http://localhost:4000
```

Frontend будет доступен на `http://localhost:3000`.

В development Next.js проксирует `/api`, `/content` и `/uploads` на `SERVER_ORIGIN` через `next.config.ts`.

## Переменные окружения

### Backend

Файл-шаблон: `apps/backend/.env.example`.

- `PORT` — порт Express-сервера.
- `SECRET_KEY` — секрет для JWT; используй собственное длинное значение.
- `DATABASE_PATH` — каталог с runtime-данными.
- `CONTENT_PATH` — каталог с медиа-контентом.
- `UPLOADS_PATH` — каталог пользовательских загрузок.

### Frontend

Файлы-шаблоны находятся в `apps/frontend`:

- `.env.dev.example` — development;
- `.env.test.example` — тестовый стенд;
- `.env.prod.example` — production.

Основные переменные:

- `NEXT_PUBLIC_API_PREFIX` — публичный prefix API, обычно `/api`.
- `NEXT_PUBLIC_SITE_URL` — URL текущего сайта.
- `SERVER_ORIGIN` — origin backend для development proxy.
- `INTERNAL_API_URL` — внутренний URL API для test/production-сценариев.
- `APP_MODE` — режим приложения.
- `BASIC_USER` и `BASIC_PASSWORD` — тестовая basic-аутентификация, если она нужна окружению.

`.env`, `.env.local` и реальные секреты не коммитятся.

## Ответственность приложений

### `apps/frontend`

Отвечает за UI, маршрутизацию, локализацию, клиентские запросы и отображение контента. Это Next.js App Router-приложение с локалями `en` и `ru`.

Полезные команды:

```sh
npm run dev          # development server
npm run build        # production build
npm run start        # запуск production build
npm run typecheck    # TypeScript без emit
npm run lint         # ESLint
npm run generate:openapi
```

### `apps/backend`

Отвечает за HTTP API, авторизацию, posts, browsing файлов и работу с хранилищами. Основные endpoint-группы находятся в `src/endpoints`:

- `auth.ts` — authentication;
- `posts.ts` — posts CRUD;
- `folderData.ts` — browsing folders and files.

Полезные команды:

```sh
npm run dev
npm run start
npm run typecheck
npm run lint
npm run generate:openapi
```

В development API также отдаёт `/content` и `/uploads` как static directories.

### `apps/openApi`

Содержит контракт API. Главный файл — `openapi/openapi.yaml`; отдельные paths и schemas подключаются через `$ref`.

Полезные команды:

```sh
npm run lint
npm run bundle
npm run preview
```

## Архитектура frontend

Frontend организован по Feature-Sliced Design. Направление зависимостей:

```text
shared < entities < features < widgets < app
```

- `shared` — переиспользуемые UI-компоненты, hooks, API utilities и общие функции;
- `entities` — бизнес-сущности и их API/model/UI;
- `features` — пользовательские действия и сценарии;
- `widgets` — крупные составные блоки страниц;
- `app` — маршруты Next.js, layouts и глобальные настройки.

Правила:

- не импортировать `entities` или `widgets` в `shared`;
- не смешивать разные slices одного слоя без специального `@x` public API;
- предпочитать public entry point `index.ts` вместо deep imports;
- бизнес-логику держать в соответствующей entity, feature или widget;
- при изменении текста обновлять оба файла в `src/i18n/messages`.

## API и OpenAPI

OpenAPI — источник истины для публичного API.

При изменении endpoint:

1. обнови схему в `apps/openApi/openapi`;
2. синхронизируй реализацию backend;
3. перегенерируй типы frontend и backend;
4. запусти lint/typecheck затронутых приложений;
5. проверь совместимость request/response и ошибок.

Генерируемые типы:

- frontend: `apps/frontend/types/openapi.ts`;
- backend: `apps/backend/src/types/openapi.ts`.

## Проверки

Запускай минимальную проверку из нужной директории:

```sh
cd apps/frontend && npm run lint
cd apps/frontend && npm run typecheck
cd apps/backend && npm run lint
cd apps/backend && npm run typecheck
cd apps/openApi && npm run lint
```

Для frontend-изменений проверяй не только типы: при доступном `next dev` используй skill `.agents/skills/next-dev-loop`, чтобы проверить compilation, server/browser errors, DOM и пользовательское взаимодействие.

## Runtime-проверки в браузере

Для `next-dev-loop` нужен CLI `agent-browser`. В этом проекте он добавлен как локальная dev-зависимость frontend:

```sh
cd apps/frontend
npm install
npx agent-browser --version
```

Запускай команды skill из `apps/frontend` через `npx`:

```sh
npx agent-browser <command>
```

Глобальная установка не требуется. Если всё же нужно использовать CLI без `npx` из любого проекта, можно установить его глобально через `npm install --global agent-browser@latest`. На macOS это может завершиться ошибкой `EACCES`, если у текущего пользователя нет прав на `/usr/local/lib`; в таком случае используй локальную установку.

Требования официального skill: Next.js 16.3+, Turbopack и `agent-browser` 0.31.1+. Запусти frontend перед runtime-проверкой:

```sh
npm run dev
```

После этого агент использует `/_next/mcp` и `agent-browser` для проверки compilation, ошибок сервера и браузера, DOM, React-дерева и пользовательских действий.

## Работа с AI-агентами

- `AGENTS.md` содержит общие правила проекта и version-matched инструкции Next.js.
- `CLAUDE.md` ссылается на `AGENTS.md`, поэтому Claude получает тот же контекст.
- Не устанавливай skills вслепую: сначала просмотри `SKILL.md` и оцени команды, которые он запускает.
- Не клади в Git секреты, `.env` с реальными значениями, runtime uploads и generated build output.

### Установка Skills

Устанавливай skills из корня репозитория, не из `apps/frontend`:

```sh
npx skills experimental_install
```

Команда читает `skills-lock.json` в корне и восстанавливает skills в `.agents/skills/`. Команды skill выполняй из рабочей директории, указанной в его документации. Например, `agent-browser` команды — из `apps/frontend`.

Действующие skills:

- **caveman** — сжатая коммуникация (ultra по умолчанию для этого проекта).
- **feature-sliced-design** — ФСД v2.1, структура, слои, импорты.
- **vercel-react-best-practices** — оптимизация React/Next.js.
- **vercel-composition-patterns** — архитектура компонентов, composition API.
- **next-dev-loop** — runtime-проверка Next.js (требует `next dev` и `agent-browser`).
- **web-design-guidelines** — audit дизайна и доступности UI.

## Лицензия

Проект не публикует лицензию. Не добавляй сторонние материалы без проверки их прав на использование.
