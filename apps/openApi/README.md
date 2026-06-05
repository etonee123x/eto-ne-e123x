# Contracts (OpenAPI) Documentation

## Overview

This package stores API contracts for the project in OpenAPI 3.0 format.

Main goals:

- single source of truth for backend/frontend API integration
- schema linting and validation
- bundled OpenAPI artifact generation
- type generation input for backend and frontend apps

## Structure

- `openapi/openapi.yaml` - root spec
- `openapi/paths/*.yaml` - endpoint operations by path
- `openapi/components/schemas/*.yaml` - reusable request/response schemas
- `dist/openapi.yaml` - bundled output (generated)

Current path contracts:

- `/auth`
- `/posts`
- `/posts/{id}`
- `/folder-data`

## Tooling

This package uses Redocly CLI.

NPM scripts in this package:

- `npm run lint` - validate OpenAPI spec
- `npm run bundle` - bundle split yaml files into `dist/openapi.yaml`
- `npm run preview -- openapi/openapi.yaml` - start local docs preview

Note: `preview` script calls Redocly preview command. Pass the spec path explicitly as shown above.

## Local Workflow

From `apps/openApi`:

```bash
npm install
npm run lint
npm run bundle
```

For local documentation preview:

```bash
npm run preview -- openapi/openapi.yaml
```

## Contract Update Checklist

When you change API behavior:

1. Update relevant path files in `openapi/paths`.
2. Update or add schemas in `openapi/components/schemas`.
3. Run `npm run lint`.
4. Run `npm run bundle`.
5. Regenerate TypeScript API types in app packages.

## Type Generation In App Packages

Contracts are consumed by both apps through `openapi-typescript`.

From `apps/backend`:

```bash
npm run generate:openapi
```

From `apps/frontend`:

```bash
npm run generate:openapi
```

Generated files:

- backend: `apps/backend/src/types/openapi.ts`
- frontend: `apps/frontend/src/types/openapi.ts`

## Conventions Used In This Spec

- Root spec references paths via `$ref` to keep files small.
- Shared models are stored in `components/schemas`.
- Authentication scheme is `cookieAuth` with cookie name `jwt`.
- Server base URL is defined in root spec `servers`.

## Common Changes

### Add New Endpoint

1. Create new file in `openapi/paths` (for example `users.yaml`).
2. Register it in `openapi/openapi.yaml` under `paths`.
3. Add or reuse schemas in `openapi/components/schemas`.
4. Lint and bundle.
5. Regenerate types in backend and frontend.

### Change Existing Response Schema

1. Update schema file in `openapi/components/schemas`.
2. Ensure endpoint response in `openapi/paths/*.yaml` references correct schema.
3. Lint and bundle.
4. Regenerate types in both app packages.
5. Fix compile errors in consumers if contract changed.

## Source Map

- Root contract: `openapi/openapi.yaml`
- Paths: `openapi/paths/`
- Schemas: `openapi/components/schemas/`
- Bundled artifact: `dist/openapi.yaml`