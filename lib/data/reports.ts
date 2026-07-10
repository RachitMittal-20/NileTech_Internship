import "server-only"

import { format } from "date-fns"

import { createClient } from "@/lib/supabase/server"

export interface ReportsFilters {
  dateFrom?: string
  dateTo?: string
  orgId?: string
}

export interface ReportRow {
  sampleId: string
  collectedAt: string
  orgId: string
  orgName: string
  testTypeName: string
  classification: "clear" | "flagged" | null
}

export interface MonthCount {
  month: string
  count: number
}

export interface ClassificationMonthCount {
  month: string
  clear: number
  flagged: number
}

export interface NamedCount {
  name: string
  count: number
}

export interface ReportsData {
  rows: ReportRow[]
  totalSamples: number
  volumeByMonth: MonthCount[]
  volumeByOrg: NamedCount[]
  volumeByTestType: NamedCount[]
  classificationByMonth: ClassificationMonthCount[]
}

export async function getReportsData(filters: ReportsFilters): Promise<ReportsData> {
  const supabase = await createClient()

  let query = supabase
    .from("samples")
    .select(
      "id, collected_at, test_cycles(org_id, organisations(name)), test_types(name), results(classification)"
    )
    .not("collected_at", "is", null)
    .order("collected_at", { ascending: true })

  if (filters.dateFrom) query = query.gte("collected_at", filters.dateFrom)
  if (filters.dateTo) query = query.lte("collected_at", `${filters.dateTo}T23:59:59`)

  const { data } = await query

  const allRows: ReportRow[] = (data ?? [])
    .filter((row) => row.collected_at && row.test_cycles)
    .map((row) => ({
      sampleId: row.id,
      collectedAt: row.collected_at as string,
      orgId: row.test_cycles?.org_id ?? "",
      orgName: row.test_cycles?.organisations?.name ?? "Unknown organisation",
      testTypeName: row.test_types?.name ?? "Unknown test",
      classification: row.results?.classification ?? null,
    }))

  const rows = filters.orgId ? allRows.filter((r) => r.orgId === filters.orgId) : allRows

  const monthMap = new Map<string, number>()
  const orgMap = new Map<string, number>()
  const testTypeMap = new Map<string, number>()
  const classificationMonthMap = new Map<string, { clear: number; flagged: number }>()

  for (const row of rows) {
    const monthKey = format(new Date(row.collectedAt), "yyyy-MM")
    monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + 1)
    orgMap.set(row.orgName, (orgMap.get(row.orgName) ?? 0) + 1)
    testTypeMap.set(row.testTypeName, (testTypeMap.get(row.testTypeName) ?? 0) + 1)

    const bucket = classificationMonthMap.get(monthKey) ?? { clear: 0, flagged: 0 }
    if (row.classification === "flagged") bucket.flagged += 1
    else if (row.classification === "clear") bucket.clear += 1
    classificationMonthMap.set(monthKey, bucket)
  }

  const sortedMonths = Array.from(monthMap.keys()).sort()

  return {
    rows,
    totalSamples: rows.length,
    volumeByMonth: sortedMonths.map((key) => ({
      month: format(new Date(`${key}-01`), "MMM yyyy"),
      count: monthMap.get(key) ?? 0,
    })),
    volumeByOrg: Array.from(orgMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    volumeByTestType: Array.from(testTypeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    classificationByMonth: sortedMonths.map((key) => ({
      month: format(new Date(`${key}-01`), "MMM yyyy"),
      clear: classificationMonthMap.get(key)?.clear ?? 0,
      flagged: classificationMonthMap.get(key)?.flagged ?? 0,
    })),
  }
}
