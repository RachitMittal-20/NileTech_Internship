import type { Metadata } from "next"
import { TestTube2 } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Result Entry — Strong Path Admin",
}

export default function ResultEntryPage() {
  return (
    <PlaceholderSection
      icon={<TestTube2 strokeWidth={1.5} />}
      title="Result Entry"
      description="Enter and review lab results for collected samples."
      emptyTitle="No samples awaiting results"
      emptyDescription="Samples show up here once they've been collected during a test cycle."
    />
  )
}
