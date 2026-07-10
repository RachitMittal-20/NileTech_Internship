import type { Metadata } from "next"
import { ClipboardList, FlagTriangleRight, Layers } from "lucide-react"

import { StatCard } from "@/components/admin/stat-card"
import { ReportsFilters } from "@/components/admin/reports/reports-filters"
import { VolumeByMonthChart } from "@/components/admin/reports/charts/volume-by-month-chart"
import { VolumeByOrgChart } from "@/components/admin/reports/charts/volume-by-org-chart"
import { VolumeByTestTypeChart } from "@/components/admin/reports/charts/volume-by-test-type-chart"
import { ClassificationOverTimeChart } from "@/components/admin/reports/charts/classification-over-time-chart"
import { getReportsData } from "@/lib/data/reports"
import { getAllOrganisationsForSelect } from "@/lib/data/employees"

export const metadata: Metadata = {
  title: "Reports — Strong Path Admin",
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const dateFrom = params.from ?? ""
  const dateTo = params.to ?? ""
  const orgId = params.org ?? ""

  const [reportsData, organisations] = await Promise.all([
    getReportsData({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, orgId: orgId || undefined }),
    getAllOrganisationsForSelect(),
  ])

  const flaggedCount = reportsData.rows.filter((r) => r.classification === "flagged").length
  const orgsRepresented = new Set(reportsData.rows.map((r) => r.orgId)).size

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Aggregate reporting across organisations, test types, and cycles.
        </p>
      </div>

      <ReportsFilters organisations={organisations} dateFrom={dateFrom} dateTo={dateTo} orgId={orgId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Tests in range" value={reportsData.totalSamples} />
        <StatCard icon={FlagTriangleRight} label="Flagged results" value={flaggedCount} />
        <StatCard icon={Layers} label="Organisations represented" value={orgsRepresented} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VolumeByMonthChart data={reportsData.volumeByMonth} />
        <VolumeByOrgChart data={reportsData.volumeByOrg} />
        <VolumeByTestTypeChart data={reportsData.volumeByTestType} />
        <ClassificationOverTimeChart data={reportsData.classificationByMonth} />
      </div>
    </div>
  )
}
