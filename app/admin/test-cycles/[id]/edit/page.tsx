import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { CycleWizard } from "@/components/admin/test-cycles/cycle-wizard"
import {
  getAllTestTypesForSelect,
  getTestCycle,
  getTestCycleRoster,
  getTestCycleTestTypeIds,
} from "@/lib/data/test-cycles"

export const metadata: Metadata = {
  title: "Edit Test Cycle — Strong Path Admin",
}

export default async function EditTestCyclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()
  if (cycle.status !== "scheduled") {
    redirect(`/admin/test-cycles/${id}`)
  }

  const [testTypeIds, roster, testTypes] = await Promise.all([
    getTestCycleTestTypeIds(id),
    getTestCycleRoster(id),
    getAllTestTypesForSelect(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Test Cycle</h1>
        <p className="text-sm text-muted-foreground">{cycle.organisations?.name}</p>
      </div>

      <CycleWizard
        organisations={[]}
        testTypes={testTypes}
        cycleId={id}
        initial={{
          orgId: cycle.org_id,
          orgName: cycle.organisations?.name ?? "",
          testTypeIds,
          employeeIds: roster.map((r) => r.employee_id),
          scheduledDate: cycle.scheduled_date,
          location: cycle.location ?? "",
        }}
      />
    </div>
  )
}
