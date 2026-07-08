import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type EmployeeListSort = "full_name" | "email" | "employee_code" | "org_name"

export interface EmployeeListRow {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  employee_code: string | null
  org_id: string
  org_name: string
}

export interface EmployeeListParams {
  q?: string
  orgId?: string
  sort?: EmployeeListSort
  dir?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export interface EmployeeListResult {
  rows: EmployeeListRow[]
  total: number
  page: number
  pageSize: number
}

export async function getEmployeesList(params: EmployeeListParams): Promise<EmployeeListResult> {
  const { q = "", orgId, sort = "full_name", dir = "asc", page = 1, pageSize = 15 } = params

  const supabase = await createClient()

  let query = supabase
    .from("employees")
    .select("id, full_name, email, phone, employee_code, org_id, organisations(name)", {
      count: "exact",
    })

  if (orgId) {
    query = query.eq("org_id", orgId)
  }

  const trimmedQ = q.trim()
  if (trimmedQ) {
    const escaped = trimmedQ.replace(/[%_]/g, (match) => `\\${match}`)
    query = query.or(
      `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,employee_code.ilike.%${escaped}%`
    )
  }

  if (sort === "org_name") {
    query = query.order("name", { referencedTable: "organisations", ascending: dir === "asc" })
  } else {
    query = query.order(sort, { ascending: dir === "asc" })
  }

  const start = (page - 1) * pageSize
  query = query.range(start, start + pageSize - 1)

  const { data, count, error } = await query

  if (error || !data) {
    return { rows: [], total: 0, page, pageSize }
  }

  const rows: EmployeeListRow[] = data.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    employee_code: row.employee_code,
    org_id: row.org_id,
    org_name: row.organisations?.name ?? "Unknown organisation",
  }))

  return { rows, total: count ?? 0, page, pageSize }
}

export async function getEmployee(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("employees")
    .select("*, organisations(id, name)")
    .eq("id", id)
    .single()
  return data
}

export async function getAllOrganisationsForSelect() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("organisations")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true })
  return data ?? []
}

export interface EmployeeTestHistoryEntry {
  sample_id: string
  cycle_id: string
  test_type_name: string
  scheduled_date: string
  cycle_status: Tables<"test_cycles">["status"]
  collected_at: string | null
  vial_reference: string | null
  result: {
    classification: Tables<"results">["classification"]
    reviewed: boolean
    entered_at: string
  } | null
}

export async function getEmployeeTestHistory(
  employeeId: string
): Promise<EmployeeTestHistoryEntry[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("samples")
    .select(
      "id, cycle_id, collected_at, vial_reference, test_types(name), test_cycles(scheduled_date, status), results(classification, reviewed, entered_at)"
    )
    .eq("employee_id", employeeId)
    .order("collected_at", { ascending: false, nullsFirst: false })

  if (!data) return []

  return data.map((sample) => ({
    sample_id: sample.id,
    cycle_id: sample.cycle_id,
    test_type_name: sample.test_types?.name ?? "Unknown test",
    scheduled_date: sample.test_cycles?.scheduled_date ?? "",
    cycle_status: sample.test_cycles?.status ?? "scheduled",
    collected_at: sample.collected_at,
    vial_reference: sample.vial_reference,
    result: sample.results
      ? {
          classification: sample.results.classification,
          reviewed: sample.results.reviewed,
          entered_at: sample.results.entered_at,
        }
      : null,
  }))
}
