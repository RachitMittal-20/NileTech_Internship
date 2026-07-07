# Architecture

Strong Path Diagnostics is one Next.js 15 (App Router) codebase that serves two
distinct applications on top of a shared design system and data layer.

## The two apps

**Admin System** — `app/(admin)`
Internal tool for the Strong Path Diagnostics team: managing client
organizations, test catalogs, orders, results, and staff access.

**Client Portal** — `app/(portal)`
Used by corporate client organizations to schedule testing, view program
status, and access their employees' results and reporting.

**Auth** — `app/(auth)`
Shared sign-in / sign-up / password-reset flows for both apps. Which app a
session is routed into is determined by the authenticated user's role, not by
which auth page they used.

`(admin)`, `(portal)`, and `(auth)` are Next.js route groups — they organize
the codebase without adding a URL segment. Route protection and role-based
redirects are enforced in middleware, not by folder structure alone.

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

This is the foundation: project scaffold, design system, and shared UI layer
only. No admin or portal features are implemented yet.
