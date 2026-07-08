import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { OrganisationHeader } from "@/components/admin/organisations/organisation-header"
import { OrganisationTabs } from "@/components/admin/organisations/organisation-tabs"
import {
  getOrganisation,
  getOrganisationEmployeeCount,
  getOrganisationPortalUsers,
  getOrganisationTestCycles,
} from "@/lib/data/organisations"
import { getEmployeesList, type EmployeeListSort } from "@/lib/data/employees"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const organisation = await getOrganisation(id)
  return { title: organisation ? `${organisation.name} — Strong Path Admin` : "Organisation" }
}

const SORT_COLUMNS: EmployeeListSort[] = ["full_name", "email", "employee_code"]

export default async function OrganisationProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams

  const organisation = await getOrganisation(id)
  if (!organisation) notFound()

  const employeesQuery = sp.q ?? ""
  const employeesSort: EmployeeListSort = SORT_COLUMNS.includes(sp.sort as EmployeeListSort)
    ? (sp.sort as EmployeeListSort)
    : "full_name"
  const employeesDir = sp.dir === "desc" ? "desc" : "asc"
  const employeesPage = Math.max(1, Number(sp.page) || 1)
  const employeesPageSize = 10

  const [employeeCount, employeesResult, cycles, portalUsers] = await Promise.all([
    getOrganisationEmployeeCount(id),
    getEmployeesList({
      q: employeesQuery,
      orgId: id,
      sort: employeesSort,
      dir: employeesDir,
      page: employeesPage,
      pageSize: employeesPageSize,
    }),
    getOrganisationTestCycles(id),
    getOrganisationPortalUsers(id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <OrganisationHeader organisation={organisation} />
      <OrganisationTabs
        organisation={organisation}
        employeeCount={employeeCount}
        employees={employeesResult}
        employeesSearchParams={sp}
        cycles={cycles}
        portalUsers={portalUsers}
      />
    </div>
  )
}
