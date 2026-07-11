import { NextResponse } from "next/server"

import { getProfile } from "@/lib/supabase/get-profile"
import { createClient } from "@/lib/supabase/server"
import { getResultsPageData } from "@/lib/data/results"
import { buildReportRows } from "@/lib/pdf/report-data"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { AggregateReport } from "@/lib/pdf/aggregate-report"
import { getReportCompany } from "@/lib/pdf/get-report-company"

// Access here is gated the same way every other generated-report route in
// this app is gated: the authenticated session must be a client_admin whose
// org owns the cycle, and the cycle's results must have actually been
// released (broadcast/complete) — there is no separate long-lived signed
// token, the session itself is the credential, consistent with the admin
// broadcast preview routes this mirrors.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile()
  if (!profile || profile.role !== "client_admin" || !profile.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: cycleId } = await params

  const supabase = await createClient()
  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("id, org_id, scheduled_date, location, status, organisations(name)")
    .eq("id", cycleId)
    .single()

  if (!cycle || cycle.org_id !== profile.org_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (cycle.status !== "broadcast" && cycle.status !== "complete") {
    return NextResponse.json({ error: "This cycle's results have not been released yet." }, { status: 403 })
  }

  const resultsData = await getResultsPageData(cycleId)
  if (!resultsData) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const rows = buildReportRows(resultsData)
  const company = await getReportCompany()
  const orgName = cycle.organisations?.name ?? "Your organization"
  const testTypeNames = Array.from(new Set(rows.map((r) => r.testTypeName)))

  const buffer = await renderReportToBuffer(
    AggregateReport({
      orgName,
      cycleDate: cycle.scheduled_date,
      location: cycle.location,
      testTypeNames,
      rows,
      generatedAt: new Date().toISOString(),
      company,
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${orgName.replace(/[^a-z0-9]+/gi, "-")}-aggregate-report.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
