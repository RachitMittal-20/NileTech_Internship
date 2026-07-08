import { Users } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import type { Tables } from "@/types/database"

type EmployeeRow = Pick<Tables<"employees">, "id" | "full_name" | "email" | "phone" | "employee_code">

export function OrganisationEmployeesTab({ employees }: { employees: EmployeeRow[] }) {
  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<Users strokeWidth={1.5} />}
        title="No employees yet"
        description="Employees added for this organization will appear here."
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
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium text-foreground">{employee.full_name}</TableCell>
              <TableCell className="text-muted-foreground">
                {employee.employee_code || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{employee.email || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{employee.phone || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
