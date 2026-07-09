import "server-only"

import { createClient } from "@/lib/supabase/server"
import { buildReportRows } from "@/lib/pdf/report-data"
import { getResultsPageData } from "@/lib/data/results"
import type { TestCycleStatus } from "@/lib/test-cycle-status"
import type { Tables } from "@/types/database"

export interface BroadcastEmployee {
  employee_id: string
  full_name: string
  employee_code: string | null
  email: string | null
  flagged: boolean
}

export interface BroadcastCycleInfo {
  cycleId: string
  orgId: string
  orgName: string
  orgContactName: string | null
  orgContactEmail: string | null
  scheduledDate: string
  location: string | null
  status: TestCycleStatus
  testTypeNames: string[]
  employees: BroadcastEmployee[]
}

export async function getBroadcastCycleInfo(cycleId: string): Promise<BroadcastCycleInfo | null> {
  const supabase = await createClient()

  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("org_id, scheduled_date, location, status, organisations(name, contact_name, contact_email)")
    .eq("id", cycleId)
    .single()

  if (!cycle) return null

  const [resultsData, { data: employeeRows }] = await Promise.all([
    getResultsPageData(cycleId),
    supabase
      .from("cycle_employees")
      .select("employee_id, status, employees(full_name, employee_code, email)")
      .eq("cycle_id", cycleId),
  ])

  const reportRows = resultsData ? buildReportRows(resultsData) : []
  const flaggedEmployeeIds = new Set(
    reportRows.filter((r) => r.classification?.flagged).map((r) => r.employeeId)
  )

  const employees: BroadcastEmployee[] = (employeeRows ?? [])
    .filter((row) => row.status !== "absent")
    .map((row) => ({
      employee_id: row.employee_id,
      full_name: row.employees?.full_name ?? "Unknown employee",
      employee_code: row.employees?.employee_code ?? null,
      email: row.employees?.email ?? null,
      flagged: flaggedEmployeeIds.has(row.employee_id),
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  return {
    cycleId,
    orgId: cycle.org_id,
    orgName: cycle.organisations?.name ?? "Unknown organisation",
    orgContactName: cycle.organisations?.contact_name ?? null,
    orgContactEmail: cycle.organisations?.contact_email ?? null,
    scheduledDate: cycle.scheduled_date,
    location: cycle.location,
    status: cycle.status,
    testTypeNames: resultsData?.testTypes.map((t) => t.name) ?? [],
    employees,
  }
}

export interface BroadcastLogEntry {
  id: string
  recipientType: Tables<"broadcasts">["recipient_type"]
  sentTo: string | null
  employeeName: string | null
  status: Tables<"broadcasts">["status"]
  sentAt: string | null
  error: string | null
  createdAt: string
}

export async function getBroadcastLog(cycleId: string): Promise<BroadcastLogEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("broadcasts")
    .select("id, recipient_type, sent_to, status, sent_at, error, created_at, employees(full_name)")
    .eq("cycle_id", cycleId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    recipientType: row.recipient_type,
    sentTo: row.sent_to,
    employeeName: row.employees?.full_name ?? null,
    status: row.status,
    sentAt: row.sent_at,
    error: row.error,
    createdAt: row.created_at,
  }))
}
