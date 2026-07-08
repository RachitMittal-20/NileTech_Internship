"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Mail, Phone, Cake, Pencil, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { EmployeeFormDialog } from "@/components/admin/employees/employee-form-dialog"
import type { Tables } from "@/types/database"

type EmployeeWithOrg = Tables<"employees"> & { organisations: { id: string; name: string } | null }

export function EmployeeHeader({
  employee,
  organisations,
}: {
  employee: EmployeeWithOrg
  organisations: { id: string; name: string }[]
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <SetBreadcrumbLabel label={employee.full_name} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {employee.full_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {employee.organisations ? (
              <Link
                href={`/admin/organisations/${employee.organisations.id}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
              >
                <Building2 className="size-3.5" />
                {employee.organisations.name}
              </Link>
            ) : null}
            {employee.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {employee.email}
              </span>
            ) : null}
            {employee.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {employee.phone}
              </span>
            ) : null}
            {employee.dob ? (
              <span className="inline-flex items-center gap-1.5">
                <Cake className="size-3.5" />
                {format(new Date(employee.dob), "MMM d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>

        <Button variant="outline" className="cursor-pointer" onClick={() => setEditOpen(true)}>
          <Pencil />
          Edit
        </Button>
      </div>

      <EmployeeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        organisations={organisations}
      />
    </div>
  )
}
