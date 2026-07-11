"use client"

import Link from "next/link"
import { format } from "date-fns"
import { FlaskConical } from "lucide-react"
import { motion } from "framer-motion"

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
import { StatusBadge } from "@/components/admin/test-cycles/status-badge"
import { fadeUp, stagger } from "@/lib/motion"
import type { TestCycleListRow } from "@/lib/data/test-cycles"

const MotionTableBody = motion.create(TableBody)
const MotionTableRow = motion.create(TableRow)

export function TestCyclesTable({ rows }: { rows: TestCycleListRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical strokeWidth={1.5} />}
        title="No test cycles found"
        description="Try adjusting your filters, or create a new test cycle to get started."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Test types</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <MotionTableBody initial="initial" animate="animate" variants={stagger}>
          {rows.map((cycle) => (
            <MotionTableRow
              key={cycle.id}
              variants={{ initial: fadeUp.initial, animate: fadeUp.animate }}
              transition={fadeUp.transition}
            >
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/test-cycles/${cycle.id}`} className="hover:underline">
                  {cycle.org_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(cycle.scheduled_date), "MMM d, yyyy")}
                {cycle.location ? ` · ${cycle.location}` : ""}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {cycle.test_type_names.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    cycle.test_type_names.map((name) => (
                      <Badge key={name} variant="outline">
                        {name}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{cycle.employee_count}</TableCell>
              <TableCell>
                <StatusBadge status={cycle.status} />
              </TableCell>
            </MotionTableRow>
          ))}
        </MotionTableBody>
      </Table>
    </div>
  )
}
