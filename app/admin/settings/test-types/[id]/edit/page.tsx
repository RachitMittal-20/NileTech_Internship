import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TestTypeForm } from "@/components/admin/settings/test-types/test-type-form"
import { getTestTypeById } from "@/lib/data/test-types-admin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const testType = await getTestTypeById(id)
  return { title: testType ? `Edit ${testType.name} — Strong Path Admin` : "Edit Test Type" }
}

export default async function EditTestTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const testType = await getTestTypeById(id)
  if (!testType) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Edit {testType.name}</h2>
        <p className="text-sm text-muted-foreground">
          Update the result fields and classification rules for this test.
        </p>
      </div>
      <TestTypeForm existing={testType} />
    </div>
  )
}
