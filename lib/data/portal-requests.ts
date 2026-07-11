import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export interface PortalCycleRequest {
  id: string
  requestedDates: string[]
  testTypeNames: string[]
  employeeScope: Tables<"cycle_requests">["employee_scope"]
  notes: string | null
  status: Tables<"cycle_requests">["status"]
  createdAt: string
}

export async function getPortalCycleRequests(orgId: string): Promise<PortalCycleRequest[]> {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from("cycle_requests")
    .select("id, requested_dates, test_type_ids, employee_scope, notes, status, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  if (!requests || requests.length === 0) return []

  const allTestTypeIds = Array.from(new Set(requests.flatMap((r) => r.test_type_ids)))
  const { data: testTypes } = await supabase.from("test_types").select("id, name").in("id", allTestTypeIds)
  const nameById = new Map((testTypes ?? []).map((t) => [t.id, t.name]))

  return requests.map((r) => ({
    id: r.id,
    requestedDates: Array.isArray(r.requested_dates) ? (r.requested_dates as string[]) : [],
    testTypeNames: r.test_type_ids.map((id) => nameById.get(id) ?? "Unknown test"),
    employeeScope: r.employee_scope,
    notes: r.notes,
    status: r.status,
    createdAt: r.created_at,
  }))
}
