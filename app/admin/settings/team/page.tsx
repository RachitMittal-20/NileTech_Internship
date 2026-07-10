import type { Metadata } from "next"

import { TeamList } from "@/components/admin/settings/team/team-list"
import { getTeamMembers } from "@/lib/data/team"
import { getProfile } from "@/lib/supabase/get-profile"

export const metadata: Metadata = {
  title: "Team — Strong Path Admin",
}

export default async function TeamSettingsPage() {
  const [members, profile] = await Promise.all([getTeamMembers(), getProfile()])

  return <TeamList members={members} currentUserId={profile?.id ?? ""} />
}
