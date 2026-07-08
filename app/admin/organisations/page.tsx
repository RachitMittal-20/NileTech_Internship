import type { Metadata } from "next"
import { Building2 } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Organisations — Strong Path Admin",
}

export default function OrganisationsPage() {
  return (
    <PlaceholderSection
      icon={<Building2 strokeWidth={1.5} />}
      title="Organisations"
      description="The client organisations you run testing programs for."
      emptyTitle="No organisations yet"
      emptyDescription="Add your first client organisation to start scheduling test cycles."
      ctaLabel="New Organisation"
    />
  )
}
