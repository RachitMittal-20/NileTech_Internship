import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

// Server-side equivalent of useProfile() for Server Components, Server
// Actions, and Route Handlers. Returns null if there's no session or no
// matching profile row.
export async function getProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile
}
