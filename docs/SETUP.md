# Setup

## Disable public sign-ups (do this once)

There's no sign-up page anywhere in the app — accounts are only ever created by
an admin (via invite) or by the seed script below. That's an application-level
control, though, and doesn't stop someone from calling
`supabase.auth.signUp()` directly against the project's public API. Close that
off in the Supabase dashboard:

**Authentication → Sign In / Providers → Email → turn off "Allow new users to
sign up".**

There's no MCP tool that can flip this setting, so it has to be done by hand.

## Seed the first admin user

Since there's no self-registration, the very first admin account has to be
created manually. Every admin after that is created by an existing admin
through the (future) org management screen, which uses the same
`inviteUserByEmail` flow as `lib/actions/invite-client-admin.ts`.

### Option A — script (recommended)

1. Make sure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` set (see `.env.example`).
2. Run:

   ```bash
   npm run seed:admin -- admin@strongpathdiagnostics.com "SomeStrongPassword!23" "Admin Name"
   ```

   This creates a confirmed `auth.users` row and a matching `public.profiles`
   row with `role = 'admin'`. If the profile insert fails after the auth user
   was created, the script prints the SQL to finish it manually.

### Option B — Supabase dashboard

1. Dashboard → **Authentication → Users → Add user** — set email + password,
   check **Auto Confirm User**.
2. Copy the generated user UUID.
3. In the SQL editor:

   ```sql
   insert into public.profiles (id, role, full_name)
   values ('<uuid>', 'admin', 'Admin Name');
   ```

## Inviting client_admin users

Once an admin is signed in, client accounts are created via
`inviteClientAdmin()` in `lib/actions/invite-client-admin.ts` — it creates the
auth user, emails them an invite link (which lands on `/reset-password` to set
their password), and creates the matching `profiles` row with
`role = 'client_admin'` and the given `org_id`. There's no UI wired to this
yet; it'll be called from the org management screen in the Admin System.

## Appointment reminder emails (Vercel Cron)

`app/api/cron/appointment-reminders/route.ts` sends a reminder email to every
org with testing scheduled exactly 3 days out. `vercel.json` schedules it
daily at 13:00 UTC via Vercel Cron:

```json
{
  "crons": [{ "path": "/api/cron/appointment-reminders", "schedule": "0 13 * * *" }]
}
```

Two env vars it depends on:

- **`CRON_SECRET`** — required. Set this in the Vercel project's environment
  variables; Vercel automatically sends it as `Authorization: Bearer
<CRON_SECRET>` on cron-triggered requests, and the route rejects anything
  else. Without it set, the route returns `500` rather than running
  unauthenticated.
- **`RESEND_API_KEY` / `RESEND_FROM_EMAIL`** — optional. If either is missing,
  the route responds `{ skipped: true, reason: "Resend is not configured." }`
  with a `200` instead of failing the cron run — appointment reminders are a
  nice-to-have, not something that should page anyone if email isn't set up
  yet.

To trigger it manually for testing (outside of Vercel's scheduler):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-deployment>/api/cron/appointment-reminders
```

Vercel Cron only runs on deployed (not local) environments — there's no local
scheduler, so use the curl command above against a deployed URL to test it.
