import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"

import { ResultsPageClient } from "@/components/admin/test-cycles/results/results-page-client"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { getTestCycle } from "@/lib/data/test-cycles"
import { getResultsPageData } from "@/lib/data/results"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cycle = await getTestCycle(id)
  return {
    title: cycle ? `${cycle.organisations?.name} results — Strong Path Admin` : "Result Entry",
  }
}

export default async function TestCycleResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()

  // Results only make sense to record once samples have come back from the
  // lab — before that there's nothing to enter, and after this stage the
  // data becomes read-only on the Review screen.
  if (cycle.status !== "results_entry") {
    redirect(`/admin/test-cycles/${id}`)
  }

  const resultsData = await getResultsPageData(id)
  if (!resultsData) notFound()

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumbLabel
        segment={id}
        label={`${cycle.organisations?.name} · ${format(new Date(cycle.scheduled_date), "MMM d, yyyy")}`}
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Result Entry</h1>
        <p className="text-sm text-muted-foreground">
          {cycle.organisations?.name} · Record lab results as they come back.
        </p>
      </div>

      <ResultsPageClient cycleId={id} data={resultsData} />
    </div>
  )
}
