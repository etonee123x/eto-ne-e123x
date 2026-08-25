# Frontend

Frontend проекта `eto-ne-e123x`: публичный веб-интерфейс для просмотра файлового контента, музыки, изображений и публикаций.

Полная документация проекта находится в корневом [README.md](../../README.md).

## Стек

| Технология | Для чего нужна |
| --- | --- |
| [Next.js](https://nextjs.org/) 16 | React-фреймворк, App Router, SSR и сборка |
| [React](https://react.dev/) 19 | Создание пользовательского интерфейса |
| [TypeScript](https://www.typescriptlang.org/) 5 | Статическая типизация JavaScript-кода |
| [next-intl](https://next-intl.dev/) | Локализация и маршрутизация по языкам |
| [TanStack Query](https://tanstack.com/query/latest) | Загрузка, кэширование и гидрация данных |
| [openapi-typescript](https://openapi-ts.dev/) | Генерация TypeScript-типов из OpenAPI-контракта |
| [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) | Типизированные HTTP-запросы к API |
| [Tailwind CSS](https://tailwindcss.com/) 4 | Утилитарная стилизация компонентов |
| [shadcn/ui](https://ui.shadcn.com/) | Базовые UI-компоненты и паттерны |
| [Lucide React](https://lucide.dev/) | Набор SVG-иконок для React |
| [Simple Icons](https://simpleicons.org/) | Иконки брендов и технологий |

Архитектура организована по **Feature-Sliced Design**:

```text
shared < entities < features < widgets < app
```

## Быстрый старт

```sh
cp .env.dev.example .env.local
npm install
npm run dev
```

Приложение откроется на `http://localhost:3000`.

Для API, запущенного локально в `apps/backend`, укажи в `.env.local`:

```dotenv
SERVER_ORIGIN=http://localhost:4000
```

В development Next.js проксирует запросы `/api`, `/content` и `/uploads` на `SERVER_ORIGIN`.

## Маршруты

Все страницы используют обязательный сегмент локали: `en` или `ru`. Например, `/en/blog` и `/ru/blog` ведут на одну страницу с разными переводами.

| Маршрут | Назначение |
| --- | --- |
| `/{locale}` | Главная страница |
| `/{locale}/blog` | Список публикаций |
| `/{locale}/blog/{postId}` | Просмотр публикации по ID |
| `/{locale}/explorer` | Корень файлового explorer |
| `/{locale}/explorer/{segments...}` | Вложенная папка или отдельный файл; глубина пути произвольная |
| любой неизвестный путь | Страница 404 |

Примеры:

```text
/en
/ru/blog
/en/blog/abc123
/ru/explorer
/en/explorer/music/album/track.mp3
```

Маршруты реализованы в `src/app/[locale]`:

- `page.tsx` — главная;
- `blog/[[...postIdAsSegmentsCrutchWFT]]` — блог и необязательный ID публикации;
- `explorer/[[...segments]]` — файловый explorer с необязательными сегментами пути;
- `[...rest]` — fallback для неизвестных маршрутов.

Поддерживаемые локали и локаль по умолчанию определены в `src/i18n/routing.ts`: `en`, `ru`, по умолчанию `en`. Переводы находятся в `src/i18n/messages`.

## Переменные окружения

Шаблоны:

- `.env.dev.example` — development;
- `.env.test.example` — тестовое окружение;
- `.env.prod.example` — production.

Основные переменные:

- `NEXT_PUBLIC_API_PREFIX` — публичный префикс API, обычно `/api`;
- `NEXT_PUBLIC_SITE_URL` — URL frontend для metadata и Open Graph;
- `SERVER_ORIGIN` — origin backend для development proxy;
- `INTERNAL_API_URL` — внутренний URL API для test/production-сценариев;
- `APP_MODE` — режим приложения;
- `BASIC_USER`, `BASIC_PASSWORD` — basic-аутентификация тестового окружения.

`.env.local` и реальные секреты не коммитятся.

## Основные каталоги

- `src/app/[locale]` — маршруты App Router, layouts и страницы;
- `src/entities` — бизнес-сущности, их API, модели и UI;
- `src/features` — пользовательские сценарии и действия;
- `src/widgets` — крупные составные блоки страниц;
- `src/shared` — переиспользуемые UI-компоненты, hooks, API и utilities;
- `src/i18n` — routing, middleware-настройки и сообщения локализации;
- `public` — статические файлы frontend.

## Команды

```sh
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run lint:fix
npm run generate:openapi
```

`npm run generate:openapi` генерирует типы API из `../openApi/openapi/openapi.yaml` в `src/types/openapi.ts`.
