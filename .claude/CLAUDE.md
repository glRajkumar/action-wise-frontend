# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Action Wise

This repo is the frontend for "Action Wise" (full product spec: `../.claude/handover.md`, cross-repo notes: `../.claude/CLAUDE.md`). The handover spec assumes a single pnpm monorepo (`apps/api`/`apps/web`/`packages/*`) — **that restructure was explicitly declined (2026-07-26); this stays a standalone repo through Phase 1.** Frontend now covers **all handover sections B–G** (2026-07-30): Workspaces, Connections & Registry, Playground (with live Firebase SDK, ring buffer, variables UI), Beautify (real JSON tree), Faker (send-to-playground), and Actions (`/actions` list + `/$actionId` step editor + run timeline). See `../backend/.claude/CLAUDE.md` for the matching API surface.

Stack matches the target spec on Router/Query/Vite/Tailwind. **Gaps vs. the spec to know about:**
- No TanStack Table, no TanStack Form — forms currently use react-hook-form + Zod (handover lists TanStack Form as the fixed choice; global rules leave this open per-project, so confirm with the user before migrating, don't do it unprompted).
- No typed RPC client to the backend. No `packages/shared` and there won't be one — Zod schemas are NOT shared with `backend/`. New API domains get their own Zod schema in `src/utils/schemas.ts`, hand-kept in sync with the backend's, not imported across repos.
- **Playground's grid board uses `@dnd-kit/core` for drag-to-reposition** (explicit user choice over react-grid-layout, the other option the backend's handover comment left open) — see the Playground section below for what dnd-kit does and doesn't cover here.
- **Firebase SDK is live** (2026-07-30): `src/lib/firebase.ts` caches one `FirebaseApp` per firebase connection (see `../DECISIONS.md`); Playground firebase tiles do real RTDB/Firestore read-once/listen/write client-side, log every execution via `POST .../tiles/:id/runs`, and warn before depth-unlimited RTDB `value` listeners. Runs unauthenticated — only open-security-rules databases work.

## Project state

TanStack Start app shell with: better-auth email/password flow, a protected `_app` layout with sidebar nav (Dashboard/Connections/Registry/Playground/Settings + workspace switcher), a large shadcn/Base UI component set, and five non-auth domains (Workspaces, Connections, Registry/Resources, Playground, Beautify/Faker) wired end-to-end through the standard `services → actions → hooks` layering against the real backend API.

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
  - `_app.tsx` — protected layout (pathless layout route). Reads `useSession()`; redirects to `/sign-in` when unauthenticated, renders `AppNav` sidebar + `Outlet` otherwise. All routes under `src/routes/_app/` (e.g. `index.tsx`, `settings.tsx`, `workspaces/`, `accept-invite.tsx`) require auth.
  - `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx` — public auth routes, sibling to `_app`.
  - `_app/workspaces/index.tsx` — list + create. `_app/workspaces/$workspaceId.tsx` — rename/delete, member list + role change/remove, invite create/list/revoke. `_app/accept-invite.tsx` — paste an invite token (reads `?token=` if present) and join; there's no real invite email yet (backend stub logs to console), so the create-invite response's `token` is shown directly in the UI as a stopgap — see `types/workspace.ts`'s comment on `WorkspaceInvite.token`.
- `src/router.tsx` — `getRouter()` factory + `Register` module augmentation. `scrollRestoration: true`, `defaultPreload: 'intent'`.
- `src/styles.css` — Tailwind entry point, imported into the root route via `?url`.
- `vite.config.ts` — plugin order matters: `devtools()`, `nitro()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`.
- Path aliases: both `#/*` and `@/*` map to `./src/*`. Prefer `@/*` for new code.

### Auth (better-auth, not the axios/JWT pattern)

This project uses **better-auth** for auth, which replaces the global `services → actions → hooks` axios pattern for this domain specifically:

- `src/lib/auth-client.ts` — `authClient` from `better-auth/client`, points at `baseURL: "http://localhost:8000"` (separate backend).
- `src/actions/auth.ts` — thin wrappers around `authClient.*` calls (sign in/up/out, session, password reset/change, email verification, delete user). Each throws `Error(error.message)` on failure so React Query's `onError` can surface it.
- `src/hooks/use-auth.ts` — TanStack Query hooks wrapping the actions (`useSession`, `useSignIn`, `useSignUp`, `useSignOut`, `useForgotPassword`, `useResetPassword`, `useSendVerificationEmail`, `useChangePassword`, `useDeleteUser`). All mutations toast via `useToast()` from `components/ui/toast` on success/error. `SESSION_KEY = ["session"]` is the shared query key; sign-in/up invalidate it, sign-out clears the whole query client and navigates to `/sign-in`.
- For any **non-auth** API domain, follow the standard global-rules layering (`services/` axios instance → `actions/` → `hooks/`), since better-auth only covers auth endpoints. Workspaces (below) is the reference implementation of this pattern.

### Workspaces (handover section B) — reference for all future non-auth domains

- `src/services/api.ts` — `sendApiReq<T>(config: AxiosRequestConfig)`, the call convention every non-auth domain uses (pattern taken from a sibling project's `send-api-req.ts`, adapted: that reference does JWT access/refresh-token header juggling per call, which doesn't apply here since this backend uses better-auth httpOnly session cookies — dropped entirely). One shared axios instance (`baseURL: "http://localhost:8000/api"`, must match `auth-client.ts`'s host, `withCredentials: true`) with a response interceptor that unwraps `res.data` and normalizes every failure into `Error & { status? }` reading the backend's `{ message }` envelope. Because normalization happens centrally, **action functions don't need try/catch at all** — they just `return sendApiReq<T>({ method, url, data })` and let it propagate; `error.message` is already the backend's message by the time a mutation's `onError` sees it.
- `src/actions/workspaces.ts` — one function per endpoint, each a one-line `sendApiReq<T>({...})` call. This is the pattern to copy for every future domain — don't reintroduce per-action try/catch or a different error-shape.
- `src/hooks/use-workspaces.ts` — same shape as `use-auth.ts`: a query-key constant/factory per resource (`WORKSPACES_KEY`, `workspaceKey(id)`, `workspaceMembersKey(id)`, `workspaceInvitesKey(id)`), one `useQuery` per read, one `useMutation` per write with `useToast()` + `useQueryClient()` invalidation on success.
- `src/types/workspace.ts` — plain domain types (`Workspace`, `WorkspaceMember`, `WorkspaceInvite`, etc.), **not** ambient `.d.ts` — per the ambient-types section below, domain entities are regular imported types, only cross-primitive UI shapes go in `general.d.ts`/`menu.d.ts`.
- `src/store/current-workspace.ts` — the first Zustand store in this repo. Holds only `activeWorkspaceId` (persisted to localStorage via `zustand/middleware`'s `persist`), read/written from `components/common/workspace-switcher.tsx` and the workspace routes. This is the pattern to copy for other client-only state — don't put server data (workspace list itself, members, etc.) in here, that's TanStack Query's job.
- `components/common/workspace-switcher.tsx` — dropdown in the sidebar header (built on `MenuWrapper` from `components/ui/menu-wrapper.tsx`, polymorphically rendered as a `SidebarMenuButton` via Base UI's `render` prop to avoid nesting two `<button>`s). Auto-picks the first workspace once the list loads if nothing valid is active.
- Role-gating in the UI (`canManageWorkspace()` in `types/workspace.ts`) is a convenience for hiding buttons a user can't use — it is **not** the security boundary, the backend's `requireWorkspaceAccess` still enforces everything server-side.

### Connections, Registry, Playground, Beautify, Faker (handover C–F)

All four follow the exact same `types/ → actions/ → hooks/ → route` layering as Workspaces. Notable pieces:

- **Flattened form schemas, not nested discriminated unions.** `utils/schemas.ts`'s `connectionFormSchema` and `resourceConfigFieldsSchema` are single flat objects with a `.superRefine()` for kind-conditional requiredness, not `z.discriminatedUnion` mirroring the backend's nested `config` shape — RHF needs one flat set of field paths to bind `Controller`s to; the flat form data is reassembled into the backend's nested `config` object (`formDataToConfig()` in each route) right before the request. Header/query-param/payload-template maps are edited as JSON-in-a-textarea (`jsonObjectSchema`), not a dynamic key/value list editor — smaller surface, same capability.
- **`components/resources/resource-config-fields.tsx`** is shared between the Registry resource form and the Playground ad-hoc tile form — both schemas intersect `resourceConfigFieldsSchema` so the field names line up under a generic `Control<T>`. If you change one form's field names you change both; don't fork this component per-caller.
- **Zod `.default()` breaks `zodResolver` + `useForm<T>` typing** — a schema field with `.default()` has a narrower input type than output type, and `useForm<InferredOutputType>` demands a `Resolver` typed to the *input* type, which no longer matches. Fixed by dropping `.default()` everywhere in these forms and setting initial values via RHF's `defaultValues` instead (already how every form here works). Don't reintroduce `.default()` on a field bound through `zodResolver` without checking this. Same root cause forced `NumberWrapper` (real `number` in/out) over `InputWrapper type="number"` + `z.coerce.number()` for the fake-data count field.
- **Playground's grid board** (`components/playground/playground-board.tsx` + `tile-card.tsx`): `@dnd-kit/core`'s `DndContext`/`useDraggable` handles drag-to-reposition with grid-cell snapping (`onDragEnd` rounds pixel delta to cell units). dnd-kit has no resize primitive, so resize is a hand-rolled `pointerdown`/`pointermove`/`pointerup` handler on a corner handle in `tile-card.tsx`. **No collision detection or auto-rearrange between overlapping tiles** — tiles can be dragged on top of each other; that's a known simplification, not a bug, see `../DECISIONS.md`.
- A tile is either `resourceId`-backed or `adhocConfig`-backed (mirrors the backend exactly) — `components/playground/render-result.tsx` renders by `renderMode`; `"json_tree"` is the real collapsible `JsonTree` (`components/common/json-tree.tsx`, hand-rolled: collapse/search/copy-path + changed-key highlighting — see `../DECISIONS.md`). Each tile keeps an in-memory ring buffer of its last 50 updates (`TileUpdate`/`pushTileUpdate` in `types/playground.ts`, scrubber in `tile-card.tsx`), a render-mode switcher, and (http tiles) a `{{variable}}` key/value panel pre-seeded by scanning the tile's templates.
- **Firebase execution is client-side and real** — `routes/_app/playground/index.tsx` dispatches by the tile's `config.mode` through `lib/firebase.ts`, tracks listener unsubscribes in a ref (cleaned up on unmount/delete), and posts every execution/listener-fire to `POST .../tiles/:id/runs`. The old manual "log a run" JSON-paste dialog is gone; `useLogFirebaseRun` deliberately has no success toast.
- **Actions UI (handover G)**: `routes/_app/actions/index.tsx` (list/create/delete) and `$actionId.tsx` (edit, step editor with resource picker filtered to `kind === "http"`, input-mapping key/value rows, up/down reorder, run dialog with starting variables, per-step pass/fail timeline with expandable request/response). Domain layer: `types/action.ts`, `actions/action-domain.ts` (named to avoid `actions/actions.ts` reading as the layer itself), `hooks/use-actions.ts`. Dashboard (`routes/_app/index.tsx`) shows count cards + recent runs via `hooks/use-runs.ts` → `GET /:workspaceId/runs`. Workspace-scoped pages render `components/common/workspace-gate.tsx` (spinner while the list loads, create-workspace CTA at zero) instead of the old "Select a workspace first." dead-end.
- Beautify/Faker have no dedicated route — they're a "Beautify" action + dialog on each resource row in `routes/_app/registry/index.tsx` (`useExportResourceType`/`useGenerateFakeData`, both modeled as on-demand `useMutation`s even though `export-type` is a GET, since the point is "trigger on click," not "auto-fetch on mount").

### Global ambient types (`src/types/`)

`general.d.ts` and `menu.d.ts` declare **global ambient types** (`itemT`, `groupT`, `allowedPrimitiveT`, `menuItemT`, `menuGroupT`, `subMenuT`, etc.) — no `.d.ts` file has imports/exports, so these types are available everywhere without importing. Used across `components/ui/menu.tsx`, `menu-wrapper.tsx`, select/combobox/autocomplete components, and `lib/utils.ts` (`isSeparator`, `isOption`, `isGroup`, `getValue`, `getLabel`, `getKey`, `itemTypeChecker`) and `lib/menu.ts` (`isSubMenu`, `isGroupMenu`, etc.). When adding a new shared shape used by multiple `components/ui` primitives, add it to these ambient files rather than a local `type`/`interface`.

### Components

- `src/components/ui/` — shadcn/Base UI primitives pulled from the `@glrk-ui` registry (`components.json`). Large existing set (accordion, combobox, date-picker, field-wrapper-rhf, menu, sidebar, toast, etc.) — check here before building a new primitive from scratch.
- `src/components/common/` — `client-wrapper.tsx` (QueryClientProvider + Toaster), `dev-tools.tsx` (TanStack Devtools panel), `nav.tsx` (`AppNav` sidebar, active-route highlighting via `useMatchRoute`, renders `workspace-switcher.tsx` in its header), `workspace-switcher.tsx` (workspace dropdown + "workspace settings" shortcut).

## Conventions specific to this repo

- Formatter is Biome with **tabs** for indentation and **double quotes** for JS/TS strings (see `biome.json`) — differs from some other repos on this machine.
- Biome's import-organize assist is on (`organizeImports: on`) — don't hand-sort imports, let `pnpm format`/`pnpm check` do it.
- `verbatimModuleSyntax` is enabled — use `import type { ... }` for type-only imports.
- Form pattern: Zod schema + inferred type in `src/utils/schemas.ts` (e.g. `signInSchema` / `SignInFormData`), consumed by react-hook-form via `field-wrapper-rhf.tsx` / `form.tsx` in `components/ui`.
- `src/utils/constants.ts` holds simple app constants (e.g. `web.name`).

## Applicable global rules

Standard layered structure per the user's global CLAUDE.md — already established for auth, extend the same way for new API domains:

```
src/services/   → axios instance + endpoint map            (api.ts — see Workspaces section)
src/actions/    → plain API-calling functions, one file per domain
src/hooks/      → TanStack Query hooks wrapping actions, one file per domain
src/store/      → Zustand (UI-only state)                   (current-workspace.ts — see Workspaces section)
src/components/ui|common|<feature>/
src/utils/      → helpers, enums, Zod schemas (all form schemas currently live together in schemas.ts)
src/types/      → global .d.ts (ambient, no imports — see above) AND plain domain type files (workspace.ts, etc.)
src/lib/        → third-party config/wrappers (auth-client, query-client, menu, utils)
```

Named exports only, no `any`, Zod + react-hook-form for forms. Add new client-only UI state to `src/store/` following `current-workspace.ts`'s pattern (small, single-purpose store) — don't grow one giant store.
