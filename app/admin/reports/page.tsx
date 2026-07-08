import type { Metadata } from "next"
import { BarChart3 } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Reports — Strong Path Admin",
}

export default function ReportsPage() {
  return (
    <PlaceholderSection
      icon={<BarChart3 strokeWidth={1.5} />}
      title="Reports"
      description="Aggregate reporting across organisations, test types, and cycles."
      emptyTitle="No data to report on yet"
      emptyDescription="Reports will populate once testing cycles start producing results."
    />
  )
}
