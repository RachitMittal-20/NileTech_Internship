import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Testing Roster — Strong Path Admin",
}

export default function TestingRosterPage() {
  return (
    <PlaceholderSection
      icon={<ClipboardList strokeWidth={1.5} />}
      title="Testing Roster"
      description="Who's expected, present, or absent for each test cycle."
      emptyTitle="No roster data yet"
      emptyDescription="Rosters appear here once a test cycle has employees assigned to it."
    />
  )
}
