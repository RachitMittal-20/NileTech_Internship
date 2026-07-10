import { NextResponse } from "next/server"

import { getProfile } from "@/lib/supabase/get-profile"
import { getResultsPageData } from "@/lib/data/results"
import { getBroadcastCycleInfo } from "@/lib/data/broadcast"
import { buildReportRows, filterRowsForEmployee } from "@/lib/pdf/report-data"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { IndividualReport } from "@/lib/pdf/individual-report"
import { getReportCompany } from "@/lib/pdf/get-report-company"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id, employeeId } = await params

  const [cycleInfo, resultsData] = await Promise.all([
    getBroadcastCycleInfo(id),
    getResultsPageData(id),
  ])

  if (!cycleInfo || !resultsData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const employee = cycleInfo.employees.find((e) => e.employee_id === employeeId)
  if (!employee) {
    return NextResponse.json({ error: "Employee not found on this cycle" }, { status: 404 })
  }

  const rows = filterRowsForEmployee(buildReportRows(resultsData), employeeId)
  const company = await getReportCompany()

  const buffer = await renderReportToBuffer(
    IndividualReport({
      employeeName: employee.full_name,
      employeeCode: employee.employee_code,
      orgName: cycleInfo.orgName,
      cycleDate: cycleInfo.scheduledDate,
      rows,
      generatedAt: new Date().toISOString(),
      company,
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${employee.full_name.replace(/[^a-z0-9]+/gi, "-")}-results.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
