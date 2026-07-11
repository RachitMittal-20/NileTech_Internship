import type { Metadata } from "next"

import { EmployeeResultsList } from "@/components/portal/results/employee-results-list"
import { BulkPdfDownloadButton } from "@/components/portal/results/bulk-pdf-download-button"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalEmployeeResults, getLatestVisibleCycleId } from "@/lib/data/portal-results"

export const metadata: Metadata = {
  title: "Employee Results — Strong Path Portal",
}

export default async function PortalResultsPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const [employees, latestCycleId] = await Promise.all([
    getPortalEmployeeResults(orgId),
    getLatestVisibleCycleId(orgId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Employee Results</h1>
          <p className="text-sm text-muted-foreground">
            Latest testing status for everyone in your organization.
          </p>
        </div>
        {latestCycleId ? <BulkPdfDownloadButton cycleId={latestCycleId} /> : null}
      </div>

      <EmployeeResultsList employees={employees} />
    </div>
  )
}
