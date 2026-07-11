import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { EmployeeTimeline } from "@/components/portal/employees/employee-timeline"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalEmployeeDetail } from "@/lib/data/portal-employee"

export const metadata: Metadata = {
  title: "Employee Results — Strong Path Portal",
}

export default async function PortalEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const employee = await getPortalEmployeeDetail(id, orgId)
  if (!employee) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/portal/results"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Employee Results
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{employee.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {employee.employeeCode ? `${employee.employeeCode} · ` : ""}
            Full testing history
          </p>
        </div>
      </div>

      <EmployeeTimeline timeline={employee.timeline} />
    </div>
  )
}
