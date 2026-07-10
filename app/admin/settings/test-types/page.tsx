import type { Metadata } from "next"

import { TestTypesList } from "@/components/admin/settings/test-types/test-types-list"
import { getAllTestTypesAdmin } from "@/lib/data/test-types-admin"

export const metadata: Metadata = {
  title: "Test Types — Strong Path Admin",
}

export default async function TestTypesSettingsPage() {
  const testTypes = await getAllTestTypesAdmin()

  return <TestTypesList testTypes={testTypes} />
}
