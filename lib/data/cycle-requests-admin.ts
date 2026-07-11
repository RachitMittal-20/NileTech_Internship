import "server-only"

import { createClient } from "@/lib/supabase/server"

export interface PendingCycleRequestSummary {
  id: string
  orgName: string
  createdAt: string
  requestedDates: string[]
  notes: string | null
}

export async function getPendingCycleRequests(): Promise<PendingCycleRequestSummary[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cycle_requests")
    .select("id, created_at, requested_dates, notes, organisations(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return (data ?? []).map((r) => ({
    id: r.id,
    orgName: r.organisations?.name ?? "Unknown organisation",
    createdAt: r.created_at,
    requestedDates: Array.isArray(r.requested_dates) ? (r.requested_dates as string[]) : [],
    notes: r.notes,
  }))
}
