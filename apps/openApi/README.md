# Contracts (OpenAPI) Documentation

## Overview

This package stores API contracts for the project in OpenAPI 3.0 format.

Main goals:

- single source of truth for backend/frontend API integration
- schema linting and validation
- bundled OpenAPI artifact generation
- type generation input for backend and frontend apps

## Structure

- contract source files
- shared schema definitions
- bundled output artifacts

## Tooling

This package uses Redocly CLI.

NPM scripts in this package:

- `npm run lint` - validate OpenAPI spec
- `npm run bundle` - bundle split yaml files into `dist/openapi.yaml`
- `npm run preview` - start local docs preview

Note: `preview` script uses Redocly preview.

## Local Workflow

From `apps/openApi`:

```bash
npm install
npm run lint
npm run bundle
```

For local documentation preview:

```bash
npm run preview
```

## Contract Update Checklist

When you change API behavior:

1. Update relevant contract definitions.
2. Update or add shared schema definitions.
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

- backend API type output
- frontend API type output

## Conventions Used In This Spec

- Contracts are modularized for maintainability.
- Shared models are reused across operations.
- Validation and bundling are required before publishing changes.

## Common Changes

### Add New Endpoint

1. Add a new operation definition in the contract source.
2. Register it in the contract index/root definition.
3. Add or reuse shared schemas.
4. Lint and bundle.
5. Regenerate types in backend and frontend.

### Change Existing Response Schema

1. Update the relevant shared schema definition.
2. Ensure related operations reference the updated schema.
3. Lint and bundle.
4. Regenerate types in both app packages.
5. Fix compile errors in consumers if contract changed.

## Additional Notes

- Detailed contract inventory and operation-level documentation are intentionally omitted from this README.