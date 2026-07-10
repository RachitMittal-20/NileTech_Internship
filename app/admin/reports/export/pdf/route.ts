import { NextResponse } from "next/server"
import { format } from "date-fns"

import { getProfile } from "@/lib/supabase/get-profile"
import { getReportsData } from "@/lib/data/reports"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { SummaryReport } from "@/lib/pdf/summary-report"
import { getReportCompany } from "@/lib/pdf/get-report-company"

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get("from")
  const dateTo = searchParams.get("to")
  const orgId = searchParams.get("org") ?? undefined

  const [reportsData, company] = await Promise.all([
    getReportsData({ dateFrom: dateFrom ?? undefined, dateTo: dateTo ?? undefined, orgId }),
    getReportCompany(),
  ])

  const orgName = orgId ? reportsData.rows[0]?.orgName ?? null : null
  const totalFlagged = reportsData.rows.filter((r) => r.classification === "flagged").length

  const buffer = await renderReportToBuffer(
    SummaryReport({
      dateFrom,
      dateTo,
      orgName,
      totalSamples: reportsData.totalSamples,
      totalFlagged,
      volumeByMonth: reportsData.volumeByMonth,
      volumeByOrg: reportsData.volumeByOrg,
      volumeByTestType: reportsData.volumeByTestType,
      classificationByMonth: reportsData.classificationByMonth,
      generatedAt: new Date().toISOString(),
      company,
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="reports-summary-${format(new Date(), "yyyy-MM-dd")}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
