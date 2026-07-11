import type { Metadata } from "next"

import { RequestTestingForm } from "@/components/portal/request/request-testing-form"
import { ExistingRequestsList } from "@/components/portal/request/existing-requests-list"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalCycleRequests } from "@/lib/data/portal-requests"
import { getAllTestTypesForSelect, getEmployeesForOrg } from "@/lib/data/test-cycles"

export const metadata: Metadata = {
  title: "Request Testing — Strong Path Portal",
}

export default async function PortalRequestPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const [testTypes, employees, requests] = await Promise.all([
    getAllTestTypesForSelect(),
    getEmployeesForOrg(orgId),
    getPortalCycleRequests(orgId),
  ])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Request Testing</h1>
          <p className="text-sm text-muted-foreground">
            Tell us when and what you need — an admin will review and schedule your cycle.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
          <RequestTestingForm testTypes={testTypes} employees={employees} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground">Your requests</h2>
        <ExistingRequestsList requests={requests} />
      </div>
    </div>
  )
}
