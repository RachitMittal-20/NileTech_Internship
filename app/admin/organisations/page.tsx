import type { Metadata } from "next"

import { OrganisationsToolbar } from "@/components/admin/organisations/organisations-toolbar"
import { OrganisationsTable } from "@/components/admin/organisations/organisations-table"
import { ListPagination } from "@/components/shared/list-pagination"
import {
  getOrganisationsList,
  type OrganisationListSort,
  type OrganisationStatusFilter,
} from "@/lib/data/organisations"

export const metadata: Metadata = {
  title: "Organisations — Strong Path Admin",
}

const SORT_COLUMNS: OrganisationListSort[] = [
  "name",
  "contact_name",
  "status",
  "employee_count",
  "active_cycles",
]

export default async function OrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const q = params.q ?? ""
  const status: OrganisationStatusFilter =
    params.status === "archived" || params.status === "all" ? params.status : "active"
  const sort: OrganisationListSort = SORT_COLUMNS.includes(params.sort as OrganisationListSort)
    ? (params.sort as OrganisationListSort)
    : "name"
  const dir = params.dir === "desc" ? "desc" : "asc"
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = 10

  const { rows, total } = await getOrganisationsList({ q, status, sort, dir, page, pageSize })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Organisations</h1>
        <p className="text-sm text-muted-foreground">
          Manage client organizations, their contacts, and portal access.
        </p>
      </div>

      <OrganisationsToolbar initialQuery={q} status={status} />

      <OrganisationsTable rows={rows} sort={sort} dir={dir} />

      <ListPagination page={page} pageSize={pageSize} total={total} searchParams={params} />
    </div>
  )
}
