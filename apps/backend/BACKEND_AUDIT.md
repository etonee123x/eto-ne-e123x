# Backend audit

Дата аудита: 2026-08-26  
Область: `apps/backend`, Express API, файловое хранилище, JSON database, auth, uploads.  
Критерий: production-стандарты Node.js/Express, безопасность OWASP API, надежность данных, наблюдаемость и сопровождаемость.

## Краткий вывод

Сервис проходит TypeScript-проверку и ESLint без ошибок, но не готов к production. Главные причины: доступ к файловой системе через пользовательский путь, небезопасная работа с именами загружаемых файлов, незащищенные JWT-cookie, неограниченное хранение upload в памяти и отсутствие сериализации записи JSON database. Эти проблемы могут привести к чтению/перезаписи файлов, краже сессии, DoS и потере данных.

## Уровни влияния

- **CRITICAL** — удаленный или простой сценарий приводит к чтению/изменению защищенных данных, захвату auth или существенной потере данных. Исправить до любого production-доступа.
- **HIGH** — вероятный DoS, нарушение целостности данных или серьезное ослабление защиты. Исправить до публичного deployment.
- **MEDIUM** — заметный эксплуатационный, контрактный или security-риск. Исправить в ближайшем hardening-цикле.
- **LOW** — качество, сопровождение, технический долг. Исправить планово.

## Findings

### CRITICAL

#### C-01. Path traversal в файловом API

Файл: [`src/modules/folderData/services/FolderDataService.ts`](src/modules/folderData/services/FolderDataService.ts#L29-L36)

`path` из `GET /folder-data` напрямую передается в `path.join(CONTENT_PATH, path)`. Проверки, что нормализованный путь остается внутри `CONTENT_PATH`, нет. Endpoint не защищен auth middleware. Аналогичный небезопасный join используется в [`src/infrastructure/files/storages/FsFilesStorage.ts`](src/infrastructure/files/storages/FsFilesStorage.ts#L15-L17) для чтения, записи и удаления.

**Воздействие:** arbitrary file read; через storage-операции также возможны запись или удаление вне разрешенной директории, если до них доходит атакующий ключ.

**Исправление:** разрешать только относительные пути; использовать `path.resolve`; проверять `relative(root, resolved)` на отсутствие `..` и абсолютного результата; отклонять symlink escape; повторить проверку внутри storage, а не только в controller/service. Добавить security-тесты на `../`, абсолютный путь, encoded traversal и symlink.

#### C-02. Незащищенная JWT-cookie

Файл: [`src/middlewares/cookieAuth.ts`](src/middlewares/cookieAuth.ts#L17-L21)

Cookie обновляется без `httpOnly: true` и `secure: true` для production. JWT доступен JavaScript-коду браузера и может передаваться по незашифрованному HTTP.

**Воздействие:** XSS или сетевой перехват могут привести к краже admin-сессии.

**Исправление:** централизованная cookie policy: `httpOnly: true`, `secure: isNodeEnvProduction`, `sameSite: 'lax'` или `strict`, явный `path`, ограниченный `maxAge`; секрет и алгоритм JWT задать конфигурацией и allow-list алгоритмов. Добавить тесты cookie flags.

#### C-03. JWT принимается через query string

Файл: [`src/middlewares/cookieAuth.ts`](src/middlewares/cookieAuth.ts#L6-L8)

`request.query.jwt` используется как fallback для auth.

**Воздействие:** токен попадает в browser history, access logs, proxy logs и Referer; это постоянный канал утечки credentials.

**Исправление:** принимать JWT только из защищенной cookie либо из `Authorization: Bearer`; удалить query fallback и провести ротацию уже скомпрометированных токенов.

#### C-04. Потеря данных и повреждение JSON database при параллельной записи

Файл: [`src/infrastructure/FsDatabaseFile.ts`](src/infrastructure/FsDatabaseFile.ts#L75-L103)

Операции read-modify-write не сериализованы и не используют lock или atomic rename. Два одновременных create/update могут прочитать один snapshot и перезаписать изменения друг друга.

**Воздействие:** silent data loss; при аварии во время `writeFile` возможен truncated/invalid JSON, после чего API перестанет читать таблицу.

**Исправление:** для production перейти на PostgreSQL с транзакциями; временный минимум — mutex на процесс, lock для нескольких instances и запись во временный файл с `rename`.

#### C-05. `deleteRowById` возвращает до завершения удаления

Файл: [`src/infrastructure/FsDatabaseFile.ts`](src/infrastructure/FsDatabaseFile.ts#L107-L119)

`readRowById` вызывается без `await`, а `writeFile` запускается без `await`. Метод фактически возвращает Promise вместо `Row` и оставляет запись в фоне.

**Воздействие:** удаление может ответить успехом до фактической записи; ошибки становятся unhandled rejection; параллельная запись усиливает потерю данных.

**Исправление:** добавить `await` для обеих операций и покрыть delete тестом, проверяющим содержимое файла после завершения запроса.

#### C-06. Отсутствующий JWT secret превращается в рабочий secret

Файл: [`src/middlewares/cookieAuth.ts`](src/middlewares/cookieAuth.ts#L14-L16)

`String(process.env.SECRET_KEY)` возвращает строку `"undefined"`, если переменная окружения не задана. Приложение не выполняет fail-fast проверку обязательного secret при startup.

**Воздействие:** deployment с пропущенной конфигурацией может принимать токены, подписанные известным значением `undefined`; это позволяет подделать auth token при знании claim structure.

**Исправление:** валидировать environment configuration до создания server; требовать непустой secret минимальной длины; не приводить отсутствующее значение через `String`; задать допустимый JWT algorithm allow-list; завершать startup с non-zero exit при ошибке конфигурации.

### HIGH

#### H-01. Имя upload-файла контролируется клиентом

Файлы: [`src/modules/posts/services/PostsService.ts`](src/modules/posts/services/PostsService.ts#L18-L20), [`src/infrastructure/files/storages/FsFilesStorage.ts`](src/infrastructure/files/storages/FsFilesStorage.ts#L15-L17)

`file.originalname` используется как storage key. В нем могут быть path separators, абсолютный путь или имя уже существующего файла. Проверка фактического MIME-типа выполняется только после записи.

**Воздействие:** path traversal, перезапись файлов, коллизии имен, подмена расширения и публикация опасного содержимого.

**Исправление:** генерировать storage key через `randomUUID`; хранить исходное имя отдельно как metadata; использовать `basename` только для display; валидировать MIME по magic bytes до записи; разрешать только нужные типы и extensions; применять `O_NOFOLLOW`/эквивалентную защиту там, где доступно.

#### H-02. Upload DoS через memory storage

Файл: [`src/modules/posts/middlewares/parseFiles.ts`](src/modules/posts/middlewares/parseFiles.ts#L3-L8)

Используется `multer.memoryStorage()`. Есть limit только `fileSize` 50 MiB; нет `files`, `fields`, `parts` и общего лимита запроса. Несколько больших файлов удерживаются в RAM до обработки.

**Воздействие:** OOM, падение процесса и отказ в обслуживании.

**Исправление:** задать строгие лимиты количества файлов, полей и частей; ограничить общий размер multipart; использовать streaming/disk/object storage с quota; rate limit upload endpoint; не запускать тяжелый metadata parsing для неразрешенного типа.

#### H-03. Нет runtime-валидации входных данных

Файлы: [`src/modules/posts/controllers/PostsController.ts`](src/modules/posts/controllers/PostsController.ts#L12-L29), [`src/modules/posts/controllers/PostsController.ts`](src/modules/posts/controllers/PostsController.ts#L39-L49)

OpenAPI-типы применяются только на уровне TypeScript. `pageSize` может стать `NaN`, отрицательным или чрезмерным; `text`, `id`, cursor и `attachments` принимаются без runtime schema validation.

**Воздействие:** некорректная pagination, дорогое чтение, 500 вместо 400, повреждение данных и неожиданные ветви бизнес-логики.

**Исправление:** добавить schema library (например, Zod/Valibot); валидировать query/body/params после multipart parsing; `pageSize` ограничить `1..100`; проверять UUID/ID, длину и нормализацию текста, структуру attachments; возвращать единый 400 response.

#### H-04. Ошибки и URL логируются небезопасно

Файл: [`src/middlewares/errorHandler.ts`](src/middlewares/errorHandler.ts#L7-L12)

В лог попадает `request.originalUrl`, а `AppError` сериализуется целиком. `cookieAuth` помещает текст ошибки JWT в `AppError`.

**Воздействие:** query token и внутренние детали могут оказаться в логах или response; `Error`-payload не является стабильным API-контрактом.

**Исправление:** redact query/cookies/authorization; генерировать request ID; клиенту отдавать `{ error: { code, message, requestId } }`; stack и внутреннее сообщение логировать только server-side; отдельно маппить Multer/JSON parse/validation errors.

#### H-05. Orphan files при частичной ошибке post операции

Файл: [`src/modules/posts/services/PostsService.ts`](src/modules/posts/services/PostsService.ts#L67-L75), [`src/modules/posts/services/PostsService.ts`](src/modules/posts/services/PostsService.ts#L88-L128)

Сначала выполняется несколько upload, затем запись post. При ошибке записи уже сохраненные файлы не удаляются. В update/delete вызовы `filesService.delete` также не await-ятся.

**Воздействие:** накопление недоступных файлов, расход диска, рассинхронизация metadata и storage.

**Исправление:** ввести compensating cleanup или transactional outbox; удалять только после успешной фиксации новой версии; await всех delete; добавить retry/garbage collector orphan files.

#### H-06. Нет graceful shutdown и lifecycle управления ресурсами

Файл: [`src/index.ts`](src/index.ts#L39-L47)

Сервер не обрабатывает `SIGTERM`/`SIGINT`, не ждет in-flight requests и не закрывает ресурсы. `pool` создается отдельно в [`src/infrastructure/pool.ts`](src/infrastructure/pool.ts#L1-L3), но lifecycle для него отсутствует.

**Воздействие:** оборванные запросы, незавершенные записи, некорректный drain при deployment и hanging process.

**Исправление:** сохранить объект `http.Server`; добавить shutdown с прекращением приема запросов, timeout, `server.close`, `pool.end`, закрытием file handles и exit code; обработать startup failure с non-zero exit.

#### H-07. JSON body принимается без лимита

Файл: [`src/index.ts`](src/index.ts#L24-L26)

`Express.json()` подключен без `limit`.

**Воздействие:** клиент может отправить чрезмерный JSON payload и занять память процесса, усиливая общий DoS-риск upload API.

**Исправление:** задать небольшой прикладной лимит через `Express.json({ limit: process.env.JSON_BODY_LIMIT ?? '1mb' })`; отдельно обрабатывать `entity.too.large` как 413; проверить лимит интеграционным тестом.

### MEDIUM

#### M-01. Нет базовых HTTP security controls

Файл: [`src/index.ts`](src/index.ts#L24-L37)

Не видны `helmet`, CORS allow-list, rate limiting, request timeout, compression policy или размер limit для `express.json()`.

**Риск:** лишняя поверхность атаки, brute force, resource exhaustion и ошибочная cross-origin политика.

**Исправление:** добавить `helmet`; явно задать CORS только для доверенных origin; rate limit отдельно для auth/read/write/upload; `express.json({ limit })`; timeout и proxy policy настроить по deployment.

#### M-02. PostgreSQL repository не реализован

Файл: [`src/modules/posts/repos/PostsPgRepo.ts`](src/modules/posts/repos/PostsPgRepo.ts#L6-L42)

Все методы бросают `Not implemented`, хотя в проекте присутствует PostgreSQL pool.

**Риск:** незавершенный production path и несоответствие заявленной persistence architecture. Сейчас `PostsModule` использует JSON repo, поэтому это не текущий runtime defect.

**Исправление:** выбрать один production storage; если PostgreSQL нужен, реализовать migrations, constraints, indexes, transactions и integration tests. Если не нужен, удалить мертвый путь и зависимость.

#### M-03. Нет health/readiness и наблюдаемости

Файлы: [`src/index.ts`](src/index.ts#L24-L47), [`src/shared/logger.ts`](src/shared/logger.ts#L1-L24)

Нет health/readiness endpoints, structured logging, request duration/status, correlation ID и метрик.

**Исправление:** добавить `/health/live` и `/health/ready`, JSON logs с timestamp/level/requestId, redaction, latency/error metrics и graceful degradation при недоступности storage.

#### M-04. Нет автоматических тестов backend

В `apps/backend` не найдены `*.test.ts` или `*.spec.ts`.

**Риск:** security и data-integrity regressions не ловятся CI; typecheck/lint не проверяют runtime behavior.

**Исправление:** добавить unit tests для path boundary, JWT cookie policy, pagination/schema, file validation и FsDatabaseFile; integration tests для всех CRUD endpoints, Multer errors, 404/500 и shutdown.

#### M-05. Контракт OpenAPI не полностью защищает реализацию

Файлы: [`../openApi/openapi/paths/posts.yaml`](../openApi/openapi/paths/posts.yaml#L42-L58), [`src/modules/posts/controllers/PostsController.ts`](src/modules/posts/controllers/PostsController.ts#L12-L19)

В OpenAPI заданы `minimum`/`maximum` для `pageSize`, но controller эти ограничения не применяет. Типизация из сгенерированного `openapi.ts` не является валидацией HTTP.

**Исправление:** генерировать или подключить runtime validators из OpenAPI либо синхронно поддерживать schemas и contract tests.

#### M-06. Невалидный multipart JSON тихо превращается в `undefined`

Файл: [`src/modules/posts/middlewares/idioticFieldMultipartFormDataToJsonParser.ts`](src/modules/posts/middlewares/idioticFieldMultipartFormDataToJsonParser.ts#L6-L13)

При ошибке `JSON.parse` middleware устанавливает `request.body[field] = undefined` и вызывает `next()` без 400-ответа или передачи ошибки.

**Риск:** клиент получает ошибочный или непредсказуемый результат вместо понятного validation error; невалидный update может дойти до service/repository.

**Исправление:** передавать typed validation error в `next(error)`; валидировать распарсенное значение schema-моделью; покрыть malformed `attachments` интеграционным тестом.

### LOW

#### L-01. ESLint baseline содержит предупреждения

`npm run lint` завершается без ошибок, но сообщает TODO в `eslint.config.ts` и unused disable в `src/types/RequestHandlerTyped.ts`.

**Исправление:** убрать устаревший disable, закрыть или осознанно оформить TODO; включить `--max-warnings=0` в CI после очистки.

#### L-02. Неединый API response/error contract

Контроллеры используют `response.send`, а ошибки возвращают экземпляр `AppError` с полями класса. Нет стабильных error codes, request ID и документированного формата для Multer/validation errors.

**Исправление:** определить versioned response contract и обновить OpenAPI.

## Приоритетный план

1. Заблокировать path traversal в `FolderDataService` и `FsFilesStorage`; добавить regression tests.
2. Ввести fail-fast validation для env, исправить cookie policy и удалить JWT из query string; ротировать секрет/токены при наличии exposure.
3. Ограничить JSON/multipart по размеру и количеству; уйти от неограниченного RAM-пути.
4. Ввести runtime validation для всех входных данных, включая multipart JSON.
5. Исправить `FsDatabaseFile`: await, atomic write и serialization; затем решить вопрос PostgreSQL.
6. Сделать file lifecycle transactional/compensating и добавить cleanup orphan files.
7. Добавить error contract, security middleware, shutdown, health/readiness и structured logs.
8. Подключить unit/integration/contract tests в CI.

## Проверки аудита

- `cd apps/backend && npm run typecheck` — pass.
- `cd apps/backend && npm run lint` — pass, 2 warnings, 0 errors.
- Автотесты backend — не обнаружены.
- Runtime penetration test, load test и production configuration audit — не выполнялись.

## Definition of done для production

- Path boundary tests, upload abuse tests и auth cookie tests проходят в CI.
- Все external inputs проходят runtime validation.
- Upload имеет лимиты request/files/bytes и не держит неограниченный объем в RAM.
- Persistence atomic/transactional и проверена конкурентными тестами.
- Ошибки не раскрывают secrets, stack traces или raw URLs.
- Есть graceful shutdown, liveness/readiness, structured logs, metrics и alerting.
- OpenAPI соответствует фактическому runtime behavior.