import type { Metadata } from "next"

import { TestCyclesToolbar } from "@/components/admin/test-cycles/test-cycles-toolbar"
import { TestCyclesTable } from "@/components/admin/test-cycles/test-cycles-table"
import { PendingRequestsBadge } from "@/components/admin/test-cycles/pending-requests-badge"
import { ListPagination } from "@/components/shared/list-pagination"
import { getTestCyclesList } from "@/lib/data/test-cycles"
import { getAllOrganisationsForSelect } from "@/lib/data/employees"
import { getPendingCycleRequests } from "@/lib/data/cycle-requests-admin"
import type { TestCycleStatus } from "@/lib/test-cycle-status"
import { STATUS_PIPELINE } from "@/lib/test-cycle-status"

export const metadata: Metadata = {
  title: "Test Cycles — Strong Path Admin",
}

export default async function TestCyclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const status: TestCycleStatus | "all" = STATUS_PIPELINE.includes(
    params.status as TestCycleStatus
  )
    ? (params.status as TestCycleStatus)
    : "all"
  const orgFilter = params.org ?? ""
  const dateFrom = params.from ?? ""
  const dateTo = params.to ?? ""
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = 15

  const [{ rows, total }, organisations, pendingRequests] = await Promise.all([
    getTestCyclesList({
      status,
      orgId: orgFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize,
    }),
    getAllOrganisationsForSelect(),
    getPendingCycleRequests(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Test Cycles</h1>
          <p className="text-sm text-muted-foreground">
            Scheduled and in-progress testing cycles across all organisations.
          </p>
        </div>
        <PendingRequestsBadge requests={pendingRequests} />
      </div>

      <TestCyclesToolbar
        status={status === "all" ? "" : status}
        orgFilter={orgFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        organisations={organisations}
      />

      <TestCyclesTable rows={rows} />

      <ListPagination page={page} pageSize={pageSize} total={total} searchParams={params} />
    </div>
  )
}
