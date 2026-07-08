"use client"

import { EmployeesToolbar } from "@/components/admin/employees/employees-toolbar"
import { EmployeesTable } from "@/components/admin/employees/employees-table"
import {
  EmployeeFormDialog,
  useEmployeeFormDialog,
} from "@/components/admin/employees/employee-form-dialog"
import { BulkUploadWizard } from "@/components/admin/employees/bulk-upload-wizard"
import { useState } from "react"
import type { EmployeeListRow, EmployeeListSort } from "@/lib/data/employees"

export function EmployeesListClient({
  rows,
  sort,
  dir,
  query,
  orgFilter,
  organisations,
  showOrgColumn,
  showOrgFilter,
  lockedOrgId,
}: {
  rows: EmployeeListRow[]
  sort: EmployeeListSort
  dir: "asc" | "desc"
  query: string
  orgFilter: string
  organisations: { id: string; name: string }[]
  showOrgColumn: boolean
  showOrgFilter: boolean
  lockedOrgId?: string
}) {
  const formDialog = useEmployeeFormDialog()
  const [bulkOpen, setBulkOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <EmployeesToolbar
        initialQuery={query}
        orgFilter={orgFilter}
        organisations={organisations}
        showOrgFilter={showOrgFilter}
        onAdd={formDialog.openCreate}
        onBulkUpload={() => setBulkOpen(true)}
      />

      <EmployeesTable
        rows={rows}
        sort={sort}
        dir={dir}
        showOrgColumn={showOrgColumn}
        onEdit={formDialog.openEdit}
      />

      <EmployeeFormDialog
        open={formDialog.open}
        onOpenChange={formDialog.setOpen}
        employee={formDialog.employee}
        organisations={organisations}
        lockedOrgId={lockedOrgId}
      />

      <BulkUploadWizard
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        organisations={organisations}
        lockedOrgId={lockedOrgId}
      />
    </div>
  )
}
