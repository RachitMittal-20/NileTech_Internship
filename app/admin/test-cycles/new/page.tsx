import type { Metadata } from "next"

import { CycleWizard } from "@/components/admin/test-cycles/cycle-wizard"
import { getAllTestTypesForSelect } from "@/lib/data/test-cycles"
import { getAllOrganisationsForSelect } from "@/lib/data/employees"

export const metadata: Metadata = {
  title: "New Test Cycle — Strong Path Admin",
}

export default async function NewTestCyclePage() {
  const [organisations, testTypes] = await Promise.all([
    getAllOrganisationsForSelect(),
    getAllTestTypesForSelect(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">New Test Cycle</h1>
        <p className="text-sm text-muted-foreground">
          Schedule a new testing cycle for a client organization.
        </p>
      </div>

      <CycleWizard organisations={organisations} testTypes={testTypes} />
    </div>
  )
}
