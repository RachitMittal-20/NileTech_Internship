"use client"

import { Building2, FlaskConical } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

// Organisation/test-cycle creation flows aren't built yet — these route to
// their list pages and let the "coming soon" toast set expectations rather
// than 404ing or silently doing nothing.
export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        className="cursor-pointer"
        onClick={() => toast.info("Organisation creation is coming soon.")}
      >
        <Building2 />
        New Organisation
      </Button>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => toast.info("Test cycle creation is coming soon.")}
      >
        <FlaskConical />
        New Test Cycle
      </Button>
    </div>
  )
}
