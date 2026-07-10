import { NextResponse } from "next/server"
import { format } from "date-fns"

import { getProfile } from "@/lib/supabase/get-profile"
import { getReportsData } from "@/lib/data/reports"

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get("from") ?? undefined
  const dateTo = searchParams.get("to") ?? undefined
  const orgId = searchParams.get("org") ?? undefined

  const { rows } = await getReportsData({ dateFrom, dateTo, orgId })

  const header = ["Collected date", "Organisation", "Test type", "Classification"]
  const lines = rows.map((row) =>
    [
      format(new Date(row.collectedAt), "yyyy-MM-dd"),
      row.orgName,
      row.testTypeName,
      row.classification ?? "pending",
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  )

  const csv = [header.join(","), ...lines].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
