import { NextResponse } from "next/server"
import JSZip from "jszip"
import { format } from "date-fns"

import { getProfile } from "@/lib/supabase/get-profile"
import { createClient } from "@/lib/supabase/server"
import { getResultsPageData } from "@/lib/data/results"
import { buildReportRows, filterRowsForEmployee } from "@/lib/pdf/report-data"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { IndividualReport } from "@/lib/pdf/individual-report"
import { getReportCompany } from "@/lib/pdf/get-report-company"

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || profile.role !== "client_admin" || !profile.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const cycleId = searchParams.get("cycleId")
  if (!cycleId) return NextResponse.json({ error: "Missing cycleId" }, { status: 400 })

  const supabase = await createClient()
  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("id, org_id, scheduled_date, status, organisations(name)")
    .eq("id", cycleId)
    .single()

  // RLS already scopes test_cycles_select to the caller's org, but a
  // deleted/mismatched id would otherwise silently produce an empty zip —
  // fail loudly instead.
  if (!cycle || cycle.org_id !== profile.org_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (cycle.status !== "broadcast" && cycle.status !== "complete") {
    return NextResponse.json({ error: "Results for this cycle have not been released yet." }, { status: 403 })
  }

  const resultsData = await getResultsPageData(cycleId)
  if (!resultsData) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const rows = buildReportRows(resultsData)
  const company = await getReportCompany()
  const orgName = cycle.organisations?.name ?? "Your organization"
  const generatedAt = new Date().toISOString()

  const zip = new JSZip()

  const employeesWithResults = resultsData.employees.filter((e) =>
    resultsData.samples.some((s) => s.employee_id === e.employee_id && s.result)
  )

  if (employeesWithResults.length === 0) {
    return NextResponse.json(
      { error: "No broadcast results available to download for this cycle." },
      { status: 404 }
    )
  }

  const failures: { employee: string; error: string }[] = []

  for (const employee of employeesWithResults) {
    const employeeRows = filterRowsForEmployee(rows, employee.employee_id)
    if (employeeRows.length === 0) continue

    try {
      const buffer = await renderReportToBuffer(
        IndividualReport({
          employeeName: employee.full_name,
          employeeCode: employee.employee_code,
          orgName,
          cycleDate: cycle.scheduled_date,
          rows: employeeRows,
          generatedAt,
          company,
        })
      )

      const safeName = employee.full_name.replace(/[^a-z0-9]+/gi, "-")
      zip.file(`${safeName}-results.pdf`, buffer)
    } catch (err) {
      // Don't let one employee's PDF failure silently produce a gap in the
      // zip — log the real error so it's diagnosable, and keep going so the
      // rest of the org's reports still download.
      const message = err instanceof Error ? err.message : String(err)
      console.error(`Bulk PDF export: failed to render report for ${employee.full_name} (${employee.employee_id}):`, err)
      failures.push({ employee: employee.full_name, error: message })
    }
  }

  if (Object.keys(zip.files).length === 0) {
    return NextResponse.json(
      {
        error: "Could not generate any PDF reports for this cycle.",
        failures,
      },
      { status: 500 }
    )
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${orgName.replace(/[^a-z0-9]+/gi, "-")}-results-${format(new Date(cycle.scheduled_date), "yyyy-MM-dd")}.zip"`,
      "Cache-Control": "no-store",
      "X-Failed-Reports": String(failures.length),
    },
  })
}
