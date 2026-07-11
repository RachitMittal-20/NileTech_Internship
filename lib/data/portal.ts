import "server-only"

import { createClient } from "@/lib/supabase/server"

export interface PortalOrg {
  id: string
  name: string
}

// Client_admin profiles always carry org_id (enforced at invite time); RLS's
// organisations_select policy scopes this to exactly one row (their own).
export async function getPortalOrg(orgId: string): Promise<PortalOrg | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("organisations").select("id, name").eq("id", orgId).maybeSingle()
  return data
}

export async function getUnreadNotificationCount(orgId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("read", false)
  return count ?? 0
}
