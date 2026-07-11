import "server-only"

import { createClient } from "@/lib/supabase/server"
import { classify, parseClassificationRules, parseResultFields, type ResultValues } from "@/lib/classification"

export interface TimelineTestResult {
  testTypeName: string
  fields: { label: string; value: string; unit?: string }[]
  classification: { label: string; flagged: boolean } | null
}

export interface TimelineEntry {
  cycleId: string
  scheduledDate: string
  location: string | null
  results: TimelineTestResult[]
}

export interface PortalEmployeeDetail {
  id: string
  fullName: string
  employeeCode: string | null
  timeline: TimelineEntry[]
}

// samples_select's RLS scopes to the caller's org; results_select additionally
// requires the cycle be in ('broadcast','complete') — so an employee's
// in-progress cycle simply won't contribute a results row here, and this
// function never needs to check status itself.
export async function getPortalEmployeeDetail(
  employeeId: string,
  orgId: string
): Promise<PortalEmployeeDetail | null> {
  const supabase = await createClient()

  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name, employee_code, org_id")
    .eq("id", employeeId)
    .maybeSingle()

  if (!employee || employee.org_id !== orgId) return null

  const { data: results } = await supabase
    .from("results")
    .select(
      "values, classification, samples!inner(employee_id, test_types(name, result_fields, classification_rules), test_cycles!inner(id, scheduled_date, location, org_id))"
    )
    .eq("samples.employee_id", employeeId)
    .eq("samples.test_cycles.org_id", orgId)
    .order("entered_at", { ascending: false })

  const cyclesById = new Map<string, TimelineEntry>()

  for (const row of results ?? []) {
    const cycle = row.samples?.test_cycles
    const testType = row.samples?.test_types
    if (!cycle || !testType) continue

    if (!cyclesById.has(cycle.id)) {
      cyclesById.set(cycle.id, {
        cycleId: cycle.id,
        scheduledDate: cycle.scheduled_date,
        location: cycle.location,
        results: [],
      })
    }

    const fields = parseResultFields(testType.result_fields)
    const rules = parseClassificationRules(testType.classification_rules)
    const values = (row.values as ResultValues) ?? {}
    const classification = classify(values, rules, fields)

    cyclesById.get(cycle.id)!.results.push({
      testTypeName: testType.name,
      fields: fields.map((f) => {
        const raw = values[f.key]
        const display =
          raw === undefined || raw === null || raw === ""
            ? "—"
            : typeof raw === "boolean"
              ? raw
                ? "Positive"
                : "Negative"
              : String(raw)
        return { label: f.label, value: display, unit: f.unit }
      }),
      classification: classification ? { label: classification.label, flagged: classification.flagged } : null,
    })
  }

  const timeline = Array.from(cyclesById.values()).sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )

  return {
    id: employee.id,
    fullName: employee.full_name,
    employeeCode: employee.employee_code,
    timeline,
  }
}
