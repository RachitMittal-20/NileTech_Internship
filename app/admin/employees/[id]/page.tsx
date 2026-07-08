import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EmployeeHeader } from "@/components/admin/employees/employee-header"
import { EmployeeTestHistory } from "@/components/admin/employees/employee-test-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getAllOrganisationsForSelect,
  getEmployee,
  getEmployeeTestHistory,
} from "@/lib/data/employees"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const employee = await getEmployee(id)
  return { title: employee ? `${employee.full_name} — Strong Path Admin` : "Employee" }
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const employee = await getEmployee(id)
  if (!employee) notFound()

  const [history, allOrganisations] = await Promise.all([
    getEmployeeTestHistory(id),
    getAllOrganisationsForSelect(),
  ])

  const organisations = employee.organisations
    ? [
        employee.organisations,
        ...allOrganisations.filter((org) => org.id !== employee.organisations?.id),
      ]
    : allOrganisations

  return (
    <div className="flex flex-col gap-6">
      <EmployeeHeader employee={employee} organisations={organisations} />

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <DetailRow label="Employee code" value={employee.employee_code} />
            <DetailRow label="Organization" value={employee.organisations?.name ?? null} />
            <DetailRow label="Total tests" value={String(history.length)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test history</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeTestHistory entries={history} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "—"}</span>
    </div>
  )
}
