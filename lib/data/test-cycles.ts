import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { TestCycleStatus } from "@/lib/test-cycle-status"
import type { Tables } from "@/types/database"

export interface TestCycleListRow {
  id: string
  org_id: string
  org_name: string
  scheduled_date: string
  location: string | null
  status: TestCycleStatus
  test_type_names: string[]
  employee_count: number
}

export interface TestCycleListParams {
  status?: TestCycleStatus | "all"
  orgId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface TestCycleListResult {
  rows: TestCycleListRow[]
  total: number
  page: number
  pageSize: number
}

export async function getTestCyclesList(
  params: TestCycleListParams
): Promise<TestCycleListResult> {
  const { status = "all", orgId, dateFrom, dateTo, page = 1, pageSize = 15 } = params

  const supabase = await createClient()

  let query = supabase
    .from("test_cycles")
    .select(
      "id, org_id, scheduled_date, location, status, organisations(name), cycle_test_types(test_types(name)), cycle_employees(count)",
      { count: "exact" }
    )

  if (status !== "all") query = query.eq("status", status)
  if (orgId) query = query.eq("org_id", orgId)
  if (dateFrom) query = query.gte("scheduled_date", dateFrom)
  if (dateTo) query = query.lte("scheduled_date", dateTo)

  query = query.order("scheduled_date", { ascending: false })

  const start = (page - 1) * pageSize
  query = query.range(start, start + pageSize - 1)

  const { data, count, error } = await query

  if (error || !data) {
    return { rows: [], total: 0, page, pageSize }
  }

  const rows: TestCycleListRow[] = data.map((cycle) => ({
    id: cycle.id,
    org_id: cycle.org_id,
    org_name: cycle.organisations?.name ?? "Unknown organisation",
    scheduled_date: cycle.scheduled_date,
    location: cycle.location,
    status: cycle.status,
    test_type_names: cycle.cycle_test_types.map((ctt) => ctt.test_types?.name ?? "").filter(Boolean),
    employee_count: cycle.cycle_employees[0]?.count ?? 0,
  }))

  return { rows, total: count ?? 0, page, pageSize }
}

export async function getTestCycle(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_cycles")
    .select("*, organisations(id, name)")
    .eq("id", id)
    .single()
  return data
}

export async function getTestCycleTestTypeIds(cycleId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cycle_test_types")
    .select("test_type_id")
    .eq("cycle_id", cycleId)
  return (data ?? []).map((row) => row.test_type_id)
}

export interface CycleRosterEntry {
  employee_id: string
  full_name: string
  employee_code: string | null
  status: Tables<"cycle_employees">["status"]
}

export async function getTestCycleRoster(cycleId: string): Promise<CycleRosterEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cycle_employees")
    .select("employee_id, status, employees(full_name, employee_code)")
    .eq("cycle_id", cycleId)
    .order("full_name", { referencedTable: "employees", ascending: true })

  return (data ?? []).map((row) => ({
    employee_id: row.employee_id,
    full_name: row.employees?.full_name ?? "Unknown employee",
    employee_code: row.employees?.employee_code ?? null,
    status: row.status,
  }))
}

export async function getTestCycleTestTypes(cycleId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cycle_test_types")
    .select("test_types(id, name)")
    .eq("cycle_id", cycleId)
  return (data ?? []).map((row) => row.test_types).filter((t): t is { id: string; name: string } => Boolean(t))
}

export async function getAllTestTypesForSelect() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_types")
    .select("id, name")
    .eq("active", true)
    .order("name", { ascending: true })
  return data ?? []
}

export async function getEmployeesForOrg(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("employees")
    .select("id, full_name, employee_code")
    .eq("org_id", orgId)
    .order("full_name", { ascending: true })
  return data ?? []
}
