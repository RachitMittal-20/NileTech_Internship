import { Badge } from "@/components/ui/badge"
import { STATUS_LABEL, type TestCycleStatus } from "@/lib/test-cycle-status"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<TestCycleStatus, string> = {
  scheduled: "bg-muted-foreground",
  testing: "bg-chart-2",
  at_lab: "bg-chart-3",
  results_entry: "bg-chart-4",
  review: "bg-chart-5",
  broadcast: "bg-primary",
  complete: "bg-chart-1",
}

export function StatusBadge({ status, className }: { status: TestCycleStatus; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </Badge>
  )
}
