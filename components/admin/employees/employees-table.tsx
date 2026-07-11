"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, ArrowUpDown, Users, Pencil } from "lucide-react"
import { motion } from "framer-motion"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { getEmployeeById } from "@/lib/actions/employees"
import { fadeUp, stagger } from "@/lib/motion"
import type { EmployeeListRow, EmployeeListSort } from "@/lib/data/employees"
import type { Tables } from "@/types/database"

const MotionTableBody = motion.create(TableBody)
const MotionTableRow = motion.create(TableRow)

export function EmployeesTable({
  rows,
  sort,
  dir,
  showOrgColumn,
  onEdit,
}: {
  rows: EmployeeListRow[]
  sort: EmployeeListSort
  dir: "asc" | "desc"
  showOrgColumn: boolean
  onEdit: (employee: Tables<"employees">) => void
}) {
  const searchParams = useSearchParams()

  const columns: { key: EmployeeListSort; label: string }[] = [
    { key: "full_name", label: "Name" },
    ...(showOrgColumn ? [{ key: "org_name" as EmployeeListSort, label: "Organization" }] : []),
    { key: "employee_code", label: "Employee code" },
    { key: "email", label: "Email" },
  ]

  function sortHref(column: EmployeeListSort) {
    const params = new URLSearchParams(searchParams.toString())
    const nextDir = sort === column && dir === "asc" ? "desc" : "asc"
    params.set("sort", column)
    params.set("dir", nextDir)
    params.set("page", "1")
    return `?${params.toString()}`
  }

  async function handleEdit(row: EmployeeListRow) {
    const full = await getEmployeeById(row.id)
    if (full) onEdit(full)
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Users strokeWidth={1.5} />}
        title="No employees found"
        description="Try adjusting your search or filters, or add an employee to get started."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                <Link
                  href={sortHref(column.key)}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  {column.label}
                  {sort === column.key ? (
                    dir === "asc" ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                  )}
                </Link>
              </TableHead>
            ))}
            <TableHead>Phone</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <MotionTableBody initial="initial" animate="animate" variants={stagger}>
          {rows.map((row) => (
            <MotionTableRow
              key={row.id}
              variants={{ initial: fadeUp.initial, animate: fadeUp.animate }}
              transition={fadeUp.transition}
            >
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/employees/${row.id}`} className="hover:underline">
                  {row.full_name}
                </Link>
              </TableCell>
              {showOrgColumn ? (
                <TableCell className="text-muted-foreground">
                  <Link href={`/admin/organisations/${row.org_id}`} className="hover:underline">
                    {row.org_name}
                  </Link>
                </TableCell>
              ) : null}
              <TableCell className="text-muted-foreground">{row.employee_code || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{row.phone || "—"}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => handleEdit(row)}
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TableCell>
            </MotionTableRow>
          ))}
        </MotionTableBody>
      </Table>
    </div>
  )
}
