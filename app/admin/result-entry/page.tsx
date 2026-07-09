import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock, MapPin, TestTube2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { getTestCyclesList } from "@/lib/data/test-cycles"

export const metadata: Metadata = {
  title: "Result Entry — Strong Path Admin",
}

export default async function ResultEntryPage() {
  const { rows: cycles } = await getTestCyclesList({ status: "results_entry", pageSize: 50 })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Result Entry</h1>
        <p className="text-sm text-muted-foreground">
          Enter and review lab results for every cycle currently in Results Entry.
        </p>
      </div>

      {cycles.length === 0 ? (
        <EmptyState
          icon={<TestTube2 strokeWidth={1.5} />}
          title="No cycles awaiting results"
          description="Cycles appear here once samples have been sent to the lab and moved into Results Entry."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {cycles.map((cycle) => (
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
                  <Link href={`/admin/test-cycles/${cycle.id}/results`}>
                    <TestTube2 />
                    Enter Results
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
