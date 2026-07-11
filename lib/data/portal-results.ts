import "server-only"

import { createClient } from "@/lib/supabase/server"

export interface PortalEmployeeResult {
  employeeId: string
  fullName: string
  employeeCode: string | null
  latestClassification: "clear" | "flagged" | null
  latestResultDate: string | null
}

// results_select RLS already restricts non-admins to samples whose cycle
// belongs to their org AND is in ('broadcast','complete') — so any row this
// query sees is safe to surface to a client_admin without extra filtering.
export async function getPortalEmployeeResults(orgId: string): Promise<PortalEmployeeResult[]> {
  const supabase = await createClient()

  const [{ data: employees }, { data: results }] = await Promise.all([
    supabase.from("employees").select("id, full_name, employee_code").eq("org_id", orgId).order("full_name"),
    supabase
      .from("results")
      .select("classification, entered_at, samples!inner(employee_id, test_cycles!inner(org_id))")
      .eq("samples.test_cycles.org_id", orgId)
      .order("entered_at", { ascending: false }),
  ])

  const latestByEmployee = new Map<string, { classification: "clear" | "flagged" | null; enteredAt: string }>()
  for (const row of results ?? []) {
    const employeeId = row.samples?.employee_id
    if (!employeeId || latestByEmployee.has(employeeId)) continue
    latestByEmployee.set(employeeId, { classification: row.classification, enteredAt: row.entered_at })
  }

  return (employees ?? []).map((e) => {
    const latest = latestByEmployee.get(e.id)
    return {
      employeeId: e.id,
      fullName: e.full_name,
      employeeCode: e.employee_code,
      latestClassification: latest?.classification ?? null,
      latestResultDate: latest?.enteredAt ?? null,
    }
  })
}

// Used to target the bulk PDF download at the most recent cycle whose
// results are actually visible (broadcast/complete, RLS-enforced).
export async function getLatestVisibleCycleId(orgId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_cycles")
    .select("id")
    .eq("org_id", orgId)
    .in("status", ["broadcast", "complete"])
    .order("scheduled_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}
