import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"

import { RosterGrid } from "@/components/admin/test-cycles/roster/roster-grid"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { getTestCycle } from "@/lib/data/test-cycles"
import { getRosterData } from "@/lib/data/roster"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cycle = await getTestCycle(id)
  return {
    title: cycle ? `${cycle.organisations?.name} roster — Strong Path Admin` : "Testing Roster",
  }
}

export default async function TestCycleRosterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()

  // The testing-day roster only makes sense while samples are actively
  // being collected — before that there's nothing to record, and after
  // the cycle has moved on this data is read-only history on the detail page.
  if (cycle.status !== "testing") {
    redirect(`/admin/test-cycles/${id}`)
  }

  const rosterData = await getRosterData(id)

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumbLabel
        segment={id}
        label={`${cycle.organisations?.name} · ${format(new Date(cycle.scheduled_date), "MMM d, yyyy")}`}
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Testing Day Roster
        </h1>
        <p className="text-sm text-muted-foreground">
          {cycle.organisations?.name} · Record vial references as employees are tested.
        </p>
      </div>

      <RosterGrid cycleId={id} data={rosterData} />
    </div>
  )
}
