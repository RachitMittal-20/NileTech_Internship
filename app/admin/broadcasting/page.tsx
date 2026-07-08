import type { Metadata } from "next"
import { Megaphone } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Broadcasting — Strong Path Admin",
}

export default function BroadcastingPage() {
  return (
    <PlaceholderSection
      icon={<Megaphone strokeWidth={1.5} />}
      title="Broadcasting"
      description="Send results and updates to organisations and employees."
      emptyTitle="Nothing to broadcast yet"
      emptyDescription="Broadcasts become available once a test cycle reaches the review stage."
    />
  )
}
