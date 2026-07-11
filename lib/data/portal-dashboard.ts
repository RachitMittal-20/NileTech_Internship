import "server-only"

import { createClient } from "@/lib/supabase/server"

export interface LatestResultsSummary {
  cycleId: string
  scheduledDate: string
  clearCount: number
  flaggedCount: number
  pendingCount: number
}

export interface PortalDashboardData {
  totalEmployees: number
  lastTestDate: string | null
  nextScheduledDate: string | null
  nextScheduledLocation: string | null
  latestResults: LatestResultsSummary | null
}

// Every query here relies on RLS (organisations/employees/test_cycles/
// samples/results select policies all scope to the caller's org_id via
// current_org_id()) — the explicit .eq("org_id", orgId) filters below are
// for correctness/readability of the query, not the security boundary.
export async function getPortalDashboardData(orgId: string): Promise<PortalDashboardData> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ count: totalEmployees }, { data: lastSample }, { data: nextCycle }, { data: latestCycle }] =
    await Promise.all([
      supabase.from("employees").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase
        .from("samples")
        .select("collected_at, test_cycles!inner(org_id)")
        .eq("test_cycles.org_id", orgId)
        .not("collected_at", "is", null)
        .order("collected_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("test_cycles")
        .select("scheduled_date, location")
        .eq("org_id", orgId)
        .gte("scheduled_date", today)
        .order("scheduled_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("test_cycles")
        .select("id, scheduled_date")
        .eq("org_id", orgId)
        .in("status", ["broadcast", "complete"])
        .order("scheduled_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  let latestResults: LatestResultsSummary | null = null

  if (latestCycle) {
    const { data: samples } = await supabase
      .from("samples")
      .select("id, results(classification)")
      .eq("cycle_id", latestCycle.id)

    let clearCount = 0
    let flaggedCount = 0
    let pendingCount = 0
    for (const s of samples ?? []) {
      const classification = s.results?.classification
      if (classification === "flagged") flaggedCount += 1
      else if (classification === "clear") clearCount += 1
      else pendingCount += 1
    }

    latestResults = {
      cycleId: latestCycle.id,
      scheduledDate: latestCycle.scheduled_date,
      clearCount,
      flaggedCount,
      pendingCount,
    }
  }

  return {
    totalEmployees: totalEmployees ?? 0,
    lastTestDate: lastSample?.collected_at ?? null,
    nextScheduledDate: nextCycle?.scheduled_date ?? null,
    nextScheduledLocation: nextCycle?.location ?? null,
    latestResults,
  }
}
