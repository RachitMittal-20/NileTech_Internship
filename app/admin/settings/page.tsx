import type { Metadata } from "next"
import { Settings } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Settings — Strong Path Admin",
}

export default function SettingsPage() {
  return (
    <PlaceholderSection
      icon={<Settings strokeWidth={1.5} />}
      title="Settings"
      description="Platform configuration and staff access."
      emptyTitle="Nothing configured yet"
      emptyDescription="Platform-wide settings and staff management land here in a future milestone."
    />
  )
}
