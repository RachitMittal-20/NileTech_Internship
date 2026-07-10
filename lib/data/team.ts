import "server-only"

import { createClient as createAdminClient } from "@/lib/supabase/admin"

export interface TeamMember {
  id: string
  fullName: string | null
  email: string | null
  isActive: boolean
  createdAt: string
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const adminClient = createAdminClient()

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, is_active, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true })

  if (!profiles || profiles.length === 0) return []

  const members = await Promise.all(
    profiles.map(async (profile) => {
      const { data } = await adminClient.auth.admin.getUserById(profile.id)
      return {
        id: profile.id,
        fullName: profile.full_name,
        email: data.user?.email ?? null,
        isActive: profile.is_active,
        createdAt: profile.created_at,
      }
    })
  )

  return members
}
