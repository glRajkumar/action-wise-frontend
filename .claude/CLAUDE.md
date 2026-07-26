# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Fresh TanStack Start scaffold — only root route (`src/routes/index.tsx`) and root layout (`src/routes/__root.tsx`) exist. No feature code yet.

## Commands

- `pnpm dev` — start dev server (port 3000)
- `pnpm build` — production build (Nitro output to `dist/`)
- `pnpm preview` — preview production build
- `pnpm generate-routes` — regenerate `src/routeTree.gen.ts` from `src/routes/**` (also runs automatically via the router-plugin on dev/build)
- `pnpm lint` / `pnpm format` / `pnpm check` — Biome lint / format / both

No test runner is configured.

## Architecture

Stack: TanStack Start (React 19) + TanStack Router (file-based routing) + Vite 8 + Tailwind CSS v4 + Nitro server adapter + Biome (lint/format).

- `src/routes/` — file-based routes. Each file exports a `Route` via `createFileRoute('/path')({...})`. Adding a file here is enough; `routeTree.gen.ts` is regenerated automatically — **never hand-edit `src/routeTree.gen.ts`**, it's generated (also excluded from Biome).
- `src/routes/__root.tsx` — root layout (`createRootRoute`). `shellComponent` renders the full `<html>` document (head/body), including `<HeadContent />` and `<Scripts />`. Anything added here wraps every route. TanStack Devtools (router panel) is mounted here, bottom-right.
- `src/router.tsx` — `getRouter()` factory consumed by the TanStack Start entry points; also declares the `Register` module augmentation TanStack Router uses for full route type-safety. `scrollRestoration: true`, `defaultPreload: 'intent'`.
- `src/styles.css` — Tailwind entry point, imported into the root route via `?url` and linked in `head()`.
- `vite.config.ts` — plugin order matters: `devtools()` first, then `nitro()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`.
- Path aliases: both `#/*` and `@/*` map to `./src/*` (see `tsconfig.json` and the `imports` field in `package.json`). Global user convention is `@/*`; prefer that for new code.

## Conventions specific to this repo

- Formatter is Biome with **tabs** for indentation and **double quotes** for JS/TS strings (see `biome.json`) — this differs from some other repos on this machine, follow the local config.
- Biome's import-organize assist is on (`organizeImports: on`) — don't hand-sort imports, let `pnpm format`/`pnpm check` do it.
- `verbatimModuleSyntax` is enabled in `tsconfig.json` — use `import type { ... }` for type-only imports, they will not be elided automatically otherwise.

## Applicable global rules

Per the user's global CLAUDE.md, this is a React + TypeScript frontend project, so the standard layered structure applies once the app grows:

```
src/services/   → axios instance + endpoint map
src/actions/    → plain API-calling functions, one file per domain
src/hooks/      → TanStack Query hooks wrapping actions, one file per domain
src/store/      → Zustand (UI-only state)
src/components/ui|common|<feature>/
src/utils/      → helpers, enums, Zod schemas
src/types/      → global .d.ts
src/lib/        → third-party config/wrappers
```

None of these directories exist yet — create them as features are added, following `services → actions → hooks` for any API call, named exports only, no `any`, Zod + react-hook-form for forms.
