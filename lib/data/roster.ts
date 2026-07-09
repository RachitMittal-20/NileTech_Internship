import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export interface RosterTestType {
  id: string
  name: string
}

export interface RosterEmployee {
  employee_id: string
  full_name: string
  employee_code: string | null
  status: Tables<"cycle_employees">["status"]
}

export interface RosterSample {
  id: string
  employee_id: string
  test_type_id: string
  vial_reference: string | null
}

export interface RosterData {
  testTypes: RosterTestType[]
  employees: RosterEmployee[]
  samples: RosterSample[]
}

export async function getRosterData(cycleId: string): Promise<RosterData> {
  const supabase = await createClient()

  const [{ data: testTypeRows }, { data: employeeRows }, { data: sampleRows }] = await Promise.all([
    supabase
      .from("cycle_test_types")
      .select("test_types(id, name)")
      .eq("cycle_id", cycleId),
    supabase
      .from("cycle_employees")
      .select("employee_id, status, employees(full_name, employee_code)")
      .eq("cycle_id", cycleId),
    supabase
      .from("samples")
      .select("id, employee_id, test_type_id, vial_reference")
      .eq("cycle_id", cycleId),
  ])

  const testTypes: RosterTestType[] = (testTypeRows ?? [])
    .map((row) => row.test_types)
    .filter((t): t is RosterTestType => Boolean(t))
    .sort((a, b) => a.name.localeCompare(b.name))

  const employees: RosterEmployee[] = (employeeRows ?? [])
    .map((row) => ({
      employee_id: row.employee_id,
      full_name: row.employees?.full_name ?? "Unknown employee",
      employee_code: row.employees?.employee_code ?? null,
      status: row.status,
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  const samples: RosterSample[] = sampleRows ?? []

  return { testTypes, employees, samples }
}
