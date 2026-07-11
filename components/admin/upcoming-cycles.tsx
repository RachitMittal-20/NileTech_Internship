import { format } from "date-fns"
import { CalendarClock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

const STATUS_LABEL: Record<Database["public"]["Enums"]["test_cycle_status"], string> = {
  scheduled: "Scheduled",
  testing: "Testing",
  at_lab: "At lab",
  results_entry: "Results entry",
  review: "Review",
  broadcast: "Broadcast",
  complete: "Complete",
}

export async function UpcomingCycles() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from("test_cycles")
    .select("id, scheduled_date, location, status, organisations(name)")
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(5)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Upcoming test cycles</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <EmptyState
            icon={<CalendarClock strokeWidth={1.5} />}
            title="No upcoming test cycles"
            description="Scheduled testing cycles will appear here once they're created."
            className="border-none py-8"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {data.map((cycle) => (
              <li key={cycle.id} className="flex items-start justify-between gap-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {cycle.organisations?.name ?? "Unknown organisation"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(cycle.scheduled_date), "MMM d, yyyy")}
                    {cycle.location ? ` · ${cycle.location}` : ""}
                  </span>
                </div>
                <Badge variant="secondary">{STATUS_LABEL[cycle.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function UpcomingCyclesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming test cycles</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
