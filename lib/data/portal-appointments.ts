import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export interface PortalAppointment {
  id: string
  scheduledDate: string
  location: string | null
  status: Tables<"test_cycles">["status"]
}

export async function getPortalAppointments(orgId: string): Promise<PortalAppointment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_cycles")
    .select("id, scheduled_date, location, status")
    .eq("org_id", orgId)
    .order("scheduled_date", { ascending: true })

  return (data ?? []).map((c) => ({
    id: c.id,
    scheduledDate: c.scheduled_date,
    location: c.location,
    status: c.status,
  }))
}
