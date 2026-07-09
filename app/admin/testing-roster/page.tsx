import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock, ClipboardList, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { CycleRoster } from "@/components/admin/test-cycles/cycle-roster"
import { getTestCycleRoster, getTestCyclesList } from "@/lib/data/test-cycles"

export const metadata: Metadata = {
  title: "Testing Roster — Strong Path Admin",
}

export default async function TestingRosterPage() {
  const { rows: cycles } = await getTestCyclesList({ status: "testing", pageSize: 50 })

  const cyclesWithRosters = await Promise.all(
    cycles.map(async (cycle) => ({
      cycle,
      roster: await getTestCycleRoster(cycle.id),
    }))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Testing Roster</h1>
        <p className="text-sm text-muted-foreground">
          Who&apos;s expected, present, or absent across every cycle currently in Testing.
        </p>
      </div>

      {cyclesWithRosters.length === 0 ? (
        <EmptyState
          icon={<ClipboardList strokeWidth={1.5} />}
          title="No cycles in testing right now"
          description="Rosters appear here once a test cycle moves into the Testing stage."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {cyclesWithRosters.map(({ cycle, roster }) => (
            <Card key={cycle.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">{cycle.org_name}</CardTitle>
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
                  <Link href={`/admin/test-cycles/${cycle.id}/roster`}>
                    <ClipboardList />
                    Open Roster
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <CycleRoster roster={roster} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
