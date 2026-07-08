import { format } from "date-fns"
import { CheckCircle2, FlaskConical, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { EmployeeTestHistoryEntry } from "@/lib/data/employees"
import type { Tables } from "@/types/database"

const CYCLE_STATUS_LABEL: Record<Tables<"test_cycles">["status"], string> = {
  scheduled: "Scheduled",
  testing: "Testing",
  at_lab: "At lab",
  results_entry: "Results entry",
  review: "Review",
  broadcast: "Broadcast",
  complete: "Complete",
}

export function EmployeeTestHistory({ entries }: { entries: EmployeeTestHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical strokeWidth={1.5} />}
        title="No test history yet"
        description="Tests this employee is assigned to will appear here once they're scheduled."
      />
    )
  }

  return (
    <ol className="flex flex-col gap-0">
      {entries.map((entry, index) => (
        <li key={entry.sample_id} className="relative flex gap-4 pb-8 last:pb-0">
          {index !== entries.length - 1 ? (
            <span className="absolute top-6 left-[15px] h-full w-px bg-border" />
          ) : null}
          <span className="z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
            {entry.result?.classification === "flagged" ? (
              <TriangleAlert className="size-4 text-destructive" />
            ) : entry.result ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <FlaskConical className="size-4 text-muted-foreground" />
            )}
          </span>
          <div className="flex flex-1 flex-col gap-1 pt-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{entry.test_type_name}</span>
              <Badge variant="secondary">{CYCLE_STATUS_LABEL[entry.cycle_status]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled {entry.scheduled_date ? format(new Date(entry.scheduled_date), "MMM d, yyyy") : "—"}
              {entry.collected_at
                ? ` · Collected ${format(new Date(entry.collected_at), "MMM d, yyyy")}`
                : ""}
              {entry.vial_reference ? ` · Vial ${entry.vial_reference}` : ""}
            </p>
            {entry.result ? (
              <p className="text-xs text-muted-foreground">
                Result: {entry.result.classification === "flagged" ? "Flagged" : "Clear"} ·{" "}
                {entry.result.reviewed ? "Reviewed" : "Pending review"} · Entered{" "}
                {format(new Date(entry.result.entered_at), "MMM d, yyyy")}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
