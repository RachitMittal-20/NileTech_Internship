import type { Metadata } from "next"

import { TestTypeForm } from "@/components/admin/settings/test-types/test-type-form"

export const metadata: Metadata = {
  title: "New Test Type — Strong Path Admin",
}

export default function NewTestTypePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">New test type</h2>
        <p className="text-sm text-muted-foreground">
          Define the result fields and classification rules for this test.
        </p>
      </div>
      <TestTypeForm />
    </div>
  )
}
