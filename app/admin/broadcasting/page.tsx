import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock, MapPin, Megaphone, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { getTestCyclesList } from "@/lib/data/test-cycles"

export const metadata: Metadata = {
  title: "Broadcasting — Strong Path Admin",
}

export default async function BroadcastingPage() {
  const [{ rows: readyCycles }, { rows: broadcastCycles }] = await Promise.all([
    getTestCyclesList({ status: "review", pageSize: 50 }),
    getTestCyclesList({ status: "broadcast", pageSize: 50 }),
  ])

  const hasAny = readyCycles.length > 0 || broadcastCycles.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Broadcasting</h1>
        <p className="text-sm text-muted-foreground">
          Send results and updates to organisations and employees.
        </p>
      </div>

      {!hasAny ? (
        <EmptyState
          icon={<Megaphone strokeWidth={1.5} />}
          title="Nothing to broadcast yet"
          description="Cycles appear here once they reach Review, ready to send results out."
        />
      ) : (
        <>
          {readyCycles.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-foreground">Ready to broadcast</h2>
              <div className="flex flex-col gap-3">
                {readyCycles.map((cycle) => (
                  <CycleBroadcastCard key={cycle.id} cycle={cycle} actionLabel="Broadcast" />
                ))}
              </div>
            </div>
          ) : null}

          {broadcastCycles.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-foreground">Already broadcast</h2>
              <div className="flex flex-col gap-3">
                {broadcastCycles.map((cycle) => (
                  <CycleBroadcastCard key={cycle.id} cycle={cycle} actionLabel="View Delivery Log" />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function CycleBroadcastCard({
  cycle,
  actionLabel,
}: {
  cycle: Awaited<ReturnType<typeof getTestCyclesList>>["rows"][number]
  actionLabel: string
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{cycle.org_name}</CardTitle>
            <Badge variant="secondary">{cycle.employee_count} employees</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {format(new Date(cycle.scheduled_date), "MMM d, yyyy")}
            </span>
            {cycle.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {cycle.location}
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="outline" className="cursor-pointer" asChild>
          <Link href={`/admin/test-cycles/${cycle.id}/broadcast`}>
            <Send />
            {actionLabel}
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}
