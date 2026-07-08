import { format } from "date-fns"
import { FlaskConical } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { Tables } from "@/types/database"

type CycleRow = Pick<Tables<"test_cycles">, "id" | "scheduled_date" | "location" | "status">

const STATUS_LABEL: Record<Tables<"test_cycles">["status"], string> = {
  scheduled: "Scheduled",
  testing: "Testing",
  at_lab: "At lab",
  results_entry: "Results entry",
  review: "Review",
  broadcast: "Broadcast",
  complete: "Complete",
}

export function OrganisationTestCyclesTab({ cycles }: { cycles: CycleRow[] }) {
  if (cycles.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical strokeWidth={1.5} />}
        title="No test cycles yet"
        description="Test cycles scheduled for this organization will appear here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cycles.map((cycle) => (
            <TableRow key={cycle.id}>
              <TableCell className="font-medium text-foreground">
                {format(new Date(cycle.scheduled_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-muted-foreground">{cycle.location || "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{STATUS_LABEL[cycle.status]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
