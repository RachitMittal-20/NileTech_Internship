# Architecture

Strong Path Diagnostics is one Next.js 15 (App Router) codebase that serves two
distinct applications on top of a shared design system and data layer.

## The two apps

**Admin System** — `app/admin` (URL prefix `/admin`)
Internal tool for the Strong Path Diagnostics team: managing client
organizations, test catalogs, orders, results, and staff access. Requires
`profiles.role = 'admin'`.

**Client Portal** — `app/portal` (URL prefix `/portal`)
Used by corporate client organizations to schedule testing, view program
status, and access their employees' results and reporting. Requires
`profiles.role = 'client_admin'`.

**Auth** — `app/(auth)`
Shared sign-in / forgot-password / reset-password flows for both apps, at
`/login`, `/forgot-password`, and `/reset-password`. `(auth)` is a route
group, so it organizes the codebase without adding a URL segment — unlike
`admin`/`portal`, which are real segments because middleware needs to match
on `/admin/*` and `/portal/*` in the URL. There is no sign-up page anywhere;
accounts are created by an admin (invite flow) or the seed script in
`docs/SETUP.md`. Which dashboard a session lands on after login is decided by
the authenticated user's `profiles.role`, not by which auth page they used.

Route protection is enforced twice, deliberately: `middleware.ts` (via
`lib/supabase/middleware.ts`) redirects unauthenticated requests to `/login`
and wrong-role requests to `/403` before a protected page ever renders, and
`app/admin/layout.tsx` / `app/portal/layout.tsx` re-check the role
server-side as defense in depth. See `docs/SETUP.md` for the auth setup
(seeding the first admin, disabling public sign-ups in the Supabase
dashboard) and the security notes in the auth system's implementation.

## Shared layers

- `components/ui` — shadcn/ui primitives (button, card, table, dialog, form,
  etc.), styled to the Strong Path design tokens. Shared by both apps.
- `components/brand` — brand-specific pieces (logo, marketing sections) used
  on public-facing pages.
- `lib` — shared utilities, constants, and (later) the Supabase client(s) and
  server actions.
- `types` — shared TypeScript types used across both apps.

## Design system

Color tokens, typography, and radii live as CSS custom properties in
`app/globals.css`, consumed via Tailwind v4's `@theme` block and shadcn/ui's
token conventions (`--primary`, `--accent`, `--sidebar`, etc.). Both apps pull
from the same token set so the two surfaces stay visually consistent while
still being distinguishable in navigation and layout.

- **Primary** — deep navy. Brand color, used for primary surfaces (sidebar,
  primary buttons in light mode) and headings.
- **Accent** — clinical teal. Used for primary CTAs, focus rings, and to
  highlight key actions/status.
- Neutral, desaturated grays for backgrounds, borders, and muted text — no
  saturated or playful colors anywhere in the palette.

## Data & infra (planned)

- **Supabase** — Postgres database, auth, and row-level security as the
  boundary between admin and client-portal data access.
- **Resend** — transactional email (auth flows, results notifications,
  invites).

See `.env.example` for the environment variables this implies.

## Status

The foundation (project scaffold, design system, shared UI layer), the
database schema, and the auth system (login, role-based routing, middleware
protection, password reset, invite flow, admin seed script) are in place. No
admin or portal features beyond placeholder dashboards are implemented yet.
