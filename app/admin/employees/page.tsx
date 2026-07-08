import type { Metadata } from "next"

import { EmployeesListClient } from "@/components/admin/employees/employees-list-client"
import { ListPagination } from "@/components/shared/list-pagination"
import {
  getAllOrganisationsForSelect,
  getEmployeesList,
  type EmployeeListSort,
} from "@/lib/data/employees"

export const metadata: Metadata = {
  title: "Employees — Strong Path Admin",
}

const SORT_COLUMNS: EmployeeListSort[] = ["full_name", "email", "employee_code", "org_name"]

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const q = params.q ?? ""
  const orgFilter = params.org ?? ""
  const sort: EmployeeListSort = SORT_COLUMNS.includes(params.sort as EmployeeListSort)
    ? (params.sort as EmployeeListSort)
    : "full_name"
  const dir = params.dir === "desc" ? "desc" : "asc"
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = 15

  const [{ rows, total }, organisations] = await Promise.all([
    getEmployeesList({ q, orgId: orgFilter || undefined, sort, dir, page, pageSize }),
    getAllOrganisationsForSelect(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Employees</h1>
        <p className="text-sm text-muted-foreground">
          Employees across every client organisation.
        </p>
      </div>

      <EmployeesListClient
        rows={rows}
        sort={sort}
        dir={dir}
        query={q}
        orgFilter={orgFilter}
        organisations={organisations}
        showOrgColumn
        showOrgFilter
      />

      <ListPagination page={page} pageSize={pageSize} total={total} searchParams={params} />
    </div>
  )
}
