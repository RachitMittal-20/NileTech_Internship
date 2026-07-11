import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export interface PortalCycleSummary {
  id: string
  scheduledDate: string
  location: string | null
  status: Tables<"test_cycles">["status"]
  testTypeNames: string[]
  participationCount: number
  reportAvailable: boolean
}

// test_cycles_select RLS scopes to the caller's org — every cycle status is
// visible here (unlike results), since a client_admin should be able to see
// an upcoming/in-progress cycle exists even before results are released.
export async function getPortalCycles(orgId: string): Promise<PortalCycleSummary[]> {
  const supabase = await createClient()

  const { data: cycles } = await supabase
    .from("test_cycles")
    .select(
      "id, scheduled_date, location, status, cycle_test_types(test_types(name)), cycle_employees(status)"
    )
    .eq("org_id", orgId)
    .order("scheduled_date", { ascending: false })

  return (cycles ?? []).map((c) => ({
    id: c.id,
    scheduledDate: c.scheduled_date,
    location: c.location,
    status: c.status,
    testTypeNames: (c.cycle_test_types ?? [])
      .map((ctt) => ctt.test_types?.name)
      .filter((name): name is string => Boolean(name)),
    participationCount: (c.cycle_employees ?? []).filter((ce) => ce.status === "present").length,
    reportAvailable: c.status === "broadcast" || c.status === "complete",
  }))
}
