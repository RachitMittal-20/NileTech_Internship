import { Users } from "lucide-react"

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
import type { CycleRosterEntry } from "@/lib/data/test-cycles"
import type { Tables } from "@/types/database"

const EMPLOYEE_STATUS_LABEL: Record<Tables<"cycle_employees">["status"], string> = {
  expected: "Expected",
  present: "Present",
  absent: "Absent",
}

const EMPLOYEE_STATUS_VARIANT: Record<Tables<"cycle_employees">["status"], "secondary" | "outline"> = {
  expected: "secondary",
  present: "secondary",
  absent: "outline",
}

export function CycleRoster({ roster }: { roster: CycleRosterEntry[] }) {
  if (roster.length === 0) {
    return (
      <EmptyState
        icon={<Users strokeWidth={1.5} />}
        title="No employees on the roster"
        description="Employees selected for this test cycle will appear here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee code</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((entry) => (
            <TableRow key={entry.employee_id}>
              <TableCell className="font-medium text-foreground">{entry.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{entry.employee_code || "—"}</TableCell>
              <TableCell>
                <Badge variant={EMPLOYEE_STATUS_VARIANT[entry.status]}>
                  {EMPLOYEE_STATUS_LABEL[entry.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
