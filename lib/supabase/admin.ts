import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

// Service-role client: bypasses RLS entirely. Server-only — the `server-only`
// import above fails the build if this module ends up in a client bundle.
// Never pass this client (or its result) across a Server Action boundary to
// the browser, and never call createClient() outside trusted server code
// (route handlers, server actions, admin-only server components).
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — the admin Supabase client cannot be created."
    )
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
