# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Auth-enabled app shell built on TanStack Start: better-auth email/password flow (sign-in/up, forgot/reset password, email verification), a protected `_app` layout with sidebar nav, and a large shadcn/Base UI component set already in place. No domain/business features beyond auth + settings yet.

## Commands

- `pnpm dev` — start dev server (port 3000)
- `pnpm build` — production build (Nitro output to `dist/`)
- `pnpm preview` — preview production build
- `pnpm generate-routes` — regenerate `src/routeTree.gen.ts` from `src/routes/**` (also runs automatically via the router-plugin on dev/build)
- `pnpm lint` / `pnpm format` / `pnpm check` — Biome lint / format / both

No test runner is configured.

## Architecture

Stack: TanStack Start (React 19) + TanStack Router (file-based routing) + Vite 8 + Tailwind CSS v4 + Nitro server adapter + Biome (lint/format) + TanStack Query + better-auth + react-hook-form/Zod + shadcn (Base UI primitives, `style: base-nova`, custom registry `@glrk-ui`).

- `src/routes/` — file-based routes. Each file exports a `Route` via `createFileRoute('/path')({...})`. Adding a file is enough; `routeTree.gen.ts` regenerates automatically — **never hand-edit `src/routeTree.gen.ts`**.
  - `__root.tsx` — document shell (`<html>`/`<head>`/`<body>`), wraps everything in `ClientWrapper` (QueryClientProvider + Toaster) and mounts `DevTools`.
  - `_app.tsx` — protected layout (pathless layout route). Reads `useSession()`; redirects to `/sign-in` when unauthenticated, renders `AppNav` sidebar + `Outlet` otherwise. All routes under `src/routes/_app/` (e.g. `index.tsx`, `settings.tsx`) require auth.
  - `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx` — public auth routes, sibling to `_app`.
- `src/router.tsx` — `getRouter()` factory + `Register` module augmentation. `scrollRestoration: true`, `defaultPreload: 'intent'`.
- `src/styles.css` — Tailwind entry point, imported into the root route via `?url`.
- `vite.config.ts` — plugin order matters: `devtools()`, `nitro()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`.
- Path aliases: both `#/*` and `@/*` map to `./src/*`. Prefer `@/*` for new code.

### Auth (better-auth, not the axios/JWT pattern)

This project uses **better-auth** for auth, which replaces the global `services → actions → hooks` axios pattern for this domain specifically:

- `src/lib/auth-client.ts` — `authClient` from `better-auth/client`, points at `baseURL: "http://localhost:8000"` (separate backend).
- `src/actions/auth.ts` — thin wrappers around `authClient.*` calls (sign in/up/out, session, password reset/change, email verification, delete user). Each throws `Error(error.message)` on failure so React Query's `onError` can surface it.
- `src/hooks/use-auth.ts` — TanStack Query hooks wrapping the actions (`useSession`, `useSignIn`, `useSignUp`, `useSignOut`, `useForgotPassword`, `useResetPassword`, `useSendVerificationEmail`, `useChangePassword`, `useDeleteUser`). All mutations toast via `useToast()` from `components/ui/toast` on success/error. `SESSION_KEY = ["session"]` is the shared query key; sign-in/up invalidate it, sign-out clears the whole query client and navigates to `/sign-in`.
- For any **non-auth** API domain, follow the standard global-rules layering (`services/` axios instance → `actions/` → `hooks/`), since better-auth only covers auth endpoints.

### Global ambient types (`src/types/`)

`general.d.ts` and `menu.d.ts` declare **global ambient types** (`itemT`, `groupT`, `allowedPrimitiveT`, `menuItemT`, `menuGroupT`, `subMenuT`, etc.) — no `.d.ts` file has imports/exports, so these types are available everywhere without importing. Used across `components/ui/menu.tsx`, `menu-wrapper.tsx`, select/combobox/autocomplete components, and `lib/utils.ts` (`isSeparator`, `isOption`, `isGroup`, `getValue`, `getLabel`, `getKey`, `itemTypeChecker`) and `lib/menu.ts` (`isSubMenu`, `isGroupMenu`, etc.). When adding a new shared shape used by multiple `components/ui` primitives, add it to these ambient files rather than a local `type`/`interface`.

### Components

- `src/components/ui/` — shadcn/Base UI primitives pulled from the `@glrk-ui` registry (`components.json`). Large existing set (accordion, combobox, date-picker, field-wrapper-rhf, menu, sidebar, toast, etc.) — check here before building a new primitive from scratch.
- `src/components/common/` — `client-wrapper.tsx` (QueryClientProvider + Toaster), `dev-tools.tsx` (TanStack Devtools panel), `nav.tsx` (`AppNav` sidebar, active-route highlighting via `useMatchRoute`).

## Conventions specific to this repo

- Formatter is Biome with **tabs** for indentation and **double quotes** for JS/TS strings (see `biome.json`) — differs from some other repos on this machine.
- Biome's import-organize assist is on (`organizeImports: on`) — don't hand-sort imports, let `pnpm format`/`pnpm check` do it.
- `verbatimModuleSyntax` is enabled — use `import type { ... }` for type-only imports.
- Form pattern: Zod schema + inferred type in `src/utils/schemas.ts` (e.g. `signInSchema` / `SignInFormData`), consumed by react-hook-form via `field-wrapper-rhf.tsx` / `form.tsx` in `components/ui`.
- `src/utils/constants.ts` holds simple app constants (e.g. `web.name`).

## Applicable global rules

Standard layered structure per the user's global CLAUDE.md — already established for auth, extend the same way for new API domains:

```
src/services/   → axios instance + endpoint map   (not yet needed — no non-auth API domain exists)
src/actions/    → plain API-calling functions, one file per domain
src/hooks/      → TanStack Query hooks wrapping actions, one file per domain
src/store/      → Zustand (UI-only state)          (not yet created)
src/components/ui|common|<feature>/
src/utils/      → helpers, enums, Zod schemas
src/types/      → global .d.ts (ambient, no imports — see above)
src/lib/        → third-party config/wrappers (auth-client, query-client, menu, utils)
```

`src/store/` doesn't exist yet — create it only when client-only UI state (modals, sidebar toggles beyond what `components/ui/sidebar` already handles) is needed. Named exports only, no `any`, Zod + react-hook-form for forms.
