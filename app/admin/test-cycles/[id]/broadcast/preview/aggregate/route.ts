import { NextResponse } from "next/server"

import { getProfile } from "@/lib/supabase/get-profile"
import { getResultsPageData } from "@/lib/data/results"
import { getBroadcastCycleInfo } from "@/lib/data/broadcast"
import { buildReportRows } from "@/lib/pdf/report-data"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { AggregateReport } from "@/lib/pdf/aggregate-report"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const [cycleInfo, resultsData] = await Promise.all([
    getBroadcastCycleInfo(id),
    getResultsPageData(id),
  ])

  if (!cycleInfo || !resultsData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const rows = buildReportRows(resultsData)

  const buffer = await renderReportToBuffer(
    AggregateReport({
      orgName: cycleInfo.orgName,
      cycleDate: cycleInfo.scheduledDate,
      location: cycleInfo.location,
      testTypeNames: cycleInfo.testTypeNames,
      rows,
      generatedAt: new Date().toISOString(),
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${cycleInfo.orgName.replace(/[^a-z0-9]+/gi, "-")}-results.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
