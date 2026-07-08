import type { Metadata } from "next"
import { FlaskConical } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Test Cycles — Strong Path Admin",
}

export default function TestCyclesPage() {
  return (
    <PlaceholderSection
      icon={<FlaskConical strokeWidth={1.5} />}
      title="Test Cycles"
      description="Scheduled and in-progress testing cycles across all organisations."
      emptyTitle="No test cycles yet"
      emptyDescription="Create a test cycle to start scheduling on-site testing for an organisation."
      ctaLabel="New Test Cycle"
    />
  )
}
