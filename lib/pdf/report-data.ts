import "server-only"

import { classify, type ClassificationResult } from "@/lib/classification"
import type { ResultsPageData } from "@/lib/data/results"

export interface ReportFieldValue {
  label: string
  value: string
  unit?: string
}

export interface ReportRow {
  employeeId: string
  employeeName: string
  employeeCode: string | null
  testTypeName: string
  fields: ReportFieldValue[]
  classification: ClassificationResult | null
  hasResult: boolean
}

export function buildReportRows(data: ResultsPageData): ReportRow[] {
  const testTypeById = new Map(data.testTypes.map((t) => [t.id, t]))
  const employeeById = new Map(data.employees.map((e) => [e.employee_id, e]))

  return data.samples
    .filter((s) => !employeeById.get(s.employee_id)?.absent)
    .map((s) => {
      const testType = testTypeById.get(s.test_type_id)
      const employee = employeeById.get(s.employee_id)
      const values = s.result?.values ?? {}

      const fields: ReportFieldValue[] = (testType?.fields ?? []).map((f) => {
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
      })

      return {
        employeeId: s.employee_id,
        employeeName: employee?.full_name ?? "Unknown employee",
        employeeCode: employee?.employee_code ?? null,
        testTypeName: testType?.name ?? "Unknown test",
        fields,
        classification: testType ? classify(values, testType.rules, testType.fields) : null,
        hasResult: Boolean(s.result),
      }
    })
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName) || a.testTypeName.localeCompare(b.testTypeName))
}

export function filterRowsForEmployee(rows: ReportRow[], employeeId: string): ReportRow[] {
  return rows.filter((r) => r.employeeId === employeeId)
}
