// One-off script to create the first admin account. There's no self-registration
// anywhere in the app, so this (or the dashboard steps in docs/SETUP.md) is how
// the very first admin user gets created.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/seed-admin.ts <email> <password> [full name]

import { createClient } from "@supabase/supabase-js"

import type { Database } from "../types/database"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Run with: npx tsx --env-file=.env.local scripts/seed-admin.ts <email> <password> [full name]"
    )
    process.exit(1)
  }

  const [, , email, password, ...nameParts] = process.argv
  const fullName = nameParts.join(" ") || undefined

  if (!email || !password) {
    console.error("Usage: npx tsx --env-file=.env.local scripts/seed-admin.ts <email> <password> [full name]")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.")
    process.exit(1)
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    console.error("Failed to create auth user:", error?.message)
    process.exit(1)
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    role: "admin",
    full_name: fullName ?? null,
  })

  if (profileError) {
    console.error("Auth user created but the profile insert failed:", profileError.message)
    console.error(
      `Retry manually in the SQL editor:\n` +
        `insert into public.profiles (id, role, full_name) values ('${data.user.id}', 'admin', ${
          fullName ? `'${fullName.replace(/'/g, "''")}'` : "null"
        });`
    )
    process.exit(1)
  }

  console.log(`Admin user created: ${email} (${data.user.id})`)
}

main()
