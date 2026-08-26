# etonee123x

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

В корне нет общего `package.json`: зависимости устанавливаются отдельно в каждом приложении.

## Установка

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

## Ответственность приложений

### `apps/frontend`

Отвечает за UI, маршрутизацию, локализацию, клиентские запросы и отображение контента.

### `apps/backend`

Отвечает за HTTP API, авторизацию, posts, browsing файлов и работу с хранилищами.

В development API также отдаёт `/content` и `/uploads` как static directories.

### `apps/openApi`

Содержит контракт API.

## API и OpenAPI

OpenAPI — источник истины для публичного API.

При изменении endpoint:

1. обнови схему в `apps/openApi/openapi`;
2. синхронизируй реализацию backend;
3. перегенерируй типы frontend и backend;
4. запусти lint/typecheck затронутых приложений;
5. проверь совместимость request/response и ошибок.

Генерируемые типы:

- frontend: `apps/frontend/src/shared/api/openapi.ts`;
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
