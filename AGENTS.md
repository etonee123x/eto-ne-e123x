<!-- BEGIN:nextjs-agent-rules -->
 
# This is NOT the Next.js you know
 
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.
 
This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
 
<!-- END:nextjs-agent-rules -->

# Repository Instructions

## Scope

- `apps/frontend`: Next.js, React, TypeScript, next-intl, FSD.
- `apps/backend`: Express API and TypeScript.
- `apps/openApi`: OpenAPI source and Redocly validation.
- `infra/content`, `infra/database`, `infra/uploads`: runtime data; preserve content paths and names.

## Rules

- Read the nearest implementation first. Keep edits focused; preserve public APIs.
- Never commit secrets, real `.env` files, generated build output, or runtime uploads.
- Read version-matched Next.js docs from `apps/frontend/node_modules/next/dist/docs/` before changing Next.js code.

## Skills

All repository skills live under `.agents/skills/` at the repository root. `skills-lock.json` also lives at the root.

### Required for every session

Read `.agents/skills/caveman/SKILL.md` before the first response. Apply its communication rules throughout the session. Default level: `ultra`.

Exceptions defined by the skill still apply: code, comments, commits, documentation, and messages intended for third parties use normal prose unless the user explicitly asks to compress them.

### Load only when task matches

Before editing, read every skill listed below whose trigger matches the task. Do not load unrelated skills.

- `.agents/skills/feature-sliced-design/SKILL.md`: frontend FSD layers, slices, imports, public APIs, or `@x` cross-imports.
- `.agents/skills/next-dev-loop/SKILL.md`: frontend runtime work, `next dev`, browser checks, or interaction validation.

If several triggers match, load all matching skills. Read each selected `SKILL.md` completely, then follow its workflow and validation requirements. Skills supplement these repository rules; when instructions conflict, use the more specific task instruction.

### Installation and paths

Install all skills from the repository root, not from `apps/frontend`:

```sh
npx skills experimental_install
```

The command reads the root `skills-lock.json` and restores skills to `.agents/skills/`. Run skill commands from the working directory stated by that skill or its documentation. For example, run frontend `agent-browser` commands from `apps/frontend`.

## Frontend constraints

- Layer order: `shared < entities < features < widgets < app`.
- Lower layers may not import higher layers; same-layer slices stay isolated.
- Prefer slice `index.ts` public APIs over deep imports. Keep domain logic out of `shared`.
- User-facing text requires matching keys in `apps/frontend/src/i18n/messages` for `en` and `ru`.

## API constraints

- OpenAPI is the source of truth. Update `apps/openApi/openapi` with endpoint changes.
- Regenerate and review frontend/backend OpenAPI types; preserve neighboring error and auth behavior.

## Validation

Run the narrowest applicable check from the app directory:

```sh
cd apps/frontend && npm run typecheck && npm run lint
cd apps/backend && npm run typecheck && npm run lint
cd apps/openApi && npm run lint
```

For frontend runtime changes, use `next-dev-loop` with Next 16.3+, Turbopack, and `agent-browser` 0.31.1+. Check compilation, server/browser errors, DOM, and the affected interaction.
