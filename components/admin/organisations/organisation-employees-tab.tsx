import { EmployeesListClient } from "@/components/admin/employees/employees-list-client"
import { ListPagination } from "@/components/shared/list-pagination"
import type { EmployeeListResult, EmployeeListSort } from "@/lib/data/employees"

export function OrganisationEmployeesTab({
  orgId,
  orgName,
  employees,
  searchParams,
}: {
  orgId: string
  orgName: string
  employees: EmployeeListResult
  searchParams: Record<string, string | undefined>
}) {
  return (
    <div className="flex flex-col gap-4">
      <EmployeesListClient
        rows={employees.rows}
        sort={(searchParams.sort as EmployeeListSort) || "full_name"}
        dir={searchParams.dir === "desc" ? "desc" : "asc"}
        query={searchParams.q ?? ""}
        orgFilter={orgId}
        organisations={[{ id: orgId, name: orgName }]}
        showOrgColumn={false}
        showOrgFilter={false}
        lockedOrgId={orgId}
      />
      <ListPagination
        page={employees.page}
        pageSize={employees.pageSize}
        total={employees.total}
        searchParams={searchParams}
      />
    </div>
  )
}
