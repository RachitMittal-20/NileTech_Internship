import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { OrganisationHeader } from "@/components/admin/organisations/organisation-header"
import { OrganisationTabs } from "@/components/admin/organisations/organisation-tabs"
import {
  getOrganisation,
  getOrganisationEmployees,
  getOrganisationPortalUsers,
  getOrganisationTestCycles,
} from "@/lib/data/organisations"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const organisation = await getOrganisation(id)
  return { title: organisation ? `${organisation.name} — Strong Path Admin` : "Organisation" }
}

export default async function OrganisationProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const organisation = await getOrganisation(id)
  if (!organisation) notFound()

  const [employees, cycles, portalUsers] = await Promise.all([
    getOrganisationEmployees(id),
    getOrganisationTestCycles(id),
    getOrganisationPortalUsers(id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <OrganisationHeader organisation={organisation} />
      <OrganisationTabs
        organisation={organisation}
        employees={employees}
        cycles={cycles}
        portalUsers={portalUsers}
      />
    </div>
  )
}
