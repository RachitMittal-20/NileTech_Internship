import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"

import { ReviewSummaryList } from "@/components/admin/test-cycles/review/review-summary-list"
import { ReadyToBroadcastButton } from "@/components/admin/test-cycles/review/ready-to-broadcast-button"
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
    title: cycle ? `${cycle.organisations?.name} review — Strong Path Admin` : "Review",
  }
}

export default async function TestCycleReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()

  if (cycle.status !== "review") {
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Review</h1>
          <p className="text-sm text-muted-foreground">
            {cycle.organisations?.name} · Confirm results before broadcasting to the client.
          </p>
        </div>
        <ReadyToBroadcastButton cycleId={id} />
      </div>

      <ReviewSummaryList data={resultsData} />
    </div>
  )
}
