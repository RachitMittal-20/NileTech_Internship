import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { TriangleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BroadcastCompose } from "@/components/admin/test-cycles/broadcast/broadcast-compose"
import { DeliveryLogTable } from "@/components/admin/test-cycles/broadcast/delivery-log-table"
import { MarkCompleteButton } from "@/components/admin/test-cycles/broadcast/mark-complete-button"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { getTestCycle } from "@/lib/data/test-cycles"
import { getBroadcastCycleInfo, getBroadcastLog } from "@/lib/data/broadcast"
import { isResendConfigured } from "@/lib/resend"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cycle = await getTestCycle(id)
  return {
    title: cycle ? `${cycle.organisations?.name} broadcast — Strong Path Admin` : "Broadcasting",
  }
}

const VIEWABLE_STATUSES = ["review", "broadcast", "complete"]

export default async function TestCycleBroadcastPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()

  // Nothing to broadcast before Review; once broadcast (or later) the
  // compose UI goes away but the delivery log + resend stay reachable.
  if (!VIEWABLE_STATUSES.includes(cycle.status)) {
    redirect(`/admin/test-cycles/${id}`)
  }

  const [cycleInfo, log] = await Promise.all([getBroadcastCycleInfo(id), getBroadcastLog(id)])
  if (!cycleInfo) notFound()

  const resendConfigured = isResendConfigured()

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumbLabel
        segment={id}
        label={`${cycle.organisations?.name} · ${format(new Date(cycle.scheduled_date), "MMM d, yyyy")}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Broadcasting</h1>
          <p className="text-sm text-muted-foreground">
            {cycleInfo.orgName} · Send results and track delivery for this cycle.
          </p>
        </div>
        {cycle.status === "broadcast" ? <MarkCompleteButton cycleId={id} /> : null}
      </div>

      {!resendConfigured ? (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>Resend is not configured</AlertTitle>
          <AlertDescription>
            Sends will be recorded as failed until this is set. Add <code>RESEND_API_KEY</code>{" "}
            and <code>RESEND_FROM_EMAIL</code> to your environment (e.g. <code>.env.local</code>)
            to enable sending.
          </AlertDescription>
        </Alert>
      ) : null}

      {cycle.status === "review" ? <BroadcastCompose cycleInfo={cycleInfo} /> : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Delivery log</h2>
        <DeliveryLogTable log={log} />
      </div>
    </div>
  )
}
