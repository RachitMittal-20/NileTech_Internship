import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  parseClassificationRules,
  parseResultFields,
  type ClassificationRule,
  type ResultFieldDef,
  type ResultValues,
} from "@/lib/classification"
import type { Tables } from "@/types/database"

export interface ResultsTestType {
  id: string
  name: string
  fields: ResultFieldDef[]
  rules: ClassificationRule[]
}

export interface ResultsEmployee {
  employee_id: string
  full_name: string
  employee_code: string | null
  absent: boolean
}

export interface ResultsSample {
  sample_id: string
  employee_id: string
  test_type_id: string
  vial_reference: string | null
  result: {
    values: ResultValues
    classification: Tables<"results">["classification"]
    lab_pdf_url: string | null
    reviewed: boolean
  } | null
}

export interface ResultsPageData {
  orgId: string
  testTypes: ResultsTestType[]
  employees: ResultsEmployee[]
  samples: ResultsSample[]
}

export async function getResultsPageData(cycleId: string): Promise<ResultsPageData | null> {
  const supabase = await createClient()

  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("org_id")
    .eq("id", cycleId)
    .single()

  if (!cycle) return null

  const [{ data: testTypeRows }, { data: employeeRows }, { data: sampleRows }] = await Promise.all([
    supabase
      .from("cycle_test_types")
      .select("test_types(id, name, result_fields, classification_rules)")
      .eq("cycle_id", cycleId),
    supabase
      .from("cycle_employees")
      .select("employee_id, status, employees(full_name, employee_code)")
      .eq("cycle_id", cycleId),
    supabase
      .from("samples")
      .select(
        "id, employee_id, test_type_id, vial_reference, results(values, classification, lab_pdf_url, reviewed)"
      )
      .eq("cycle_id", cycleId),
  ])

  const testTypes: ResultsTestType[] = (testTypeRows ?? [])
    .map((row) => row.test_types)
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({
      id: t.id,
      name: t.name,
      fields: parseResultFields(t.result_fields),
      rules: parseClassificationRules(t.classification_rules),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const employees: ResultsEmployee[] = (employeeRows ?? [])
    .map((row) => ({
      employee_id: row.employee_id,
      full_name: row.employees?.full_name ?? "Unknown employee",
      employee_code: row.employees?.employee_code ?? null,
      absent: row.status === "absent",
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  const samples: ResultsSample[] = (sampleRows ?? []).map((row) => ({
    sample_id: row.id,
    employee_id: row.employee_id,
    test_type_id: row.test_type_id,
    vial_reference: row.vial_reference,
    result: row.results
      ? {
          values: (row.results.values as ResultValues) ?? {},
          classification: row.results.classification,
          lab_pdf_url: row.results.lab_pdf_url,
          reviewed: row.results.reviewed,
        }
      : null,
  }))

  return { orgId: cycle.org_id, testTypes, employees, samples }
}
