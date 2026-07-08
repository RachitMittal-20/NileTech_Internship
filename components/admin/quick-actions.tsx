"use client"

import Link from "next/link"
import { Building2, FlaskConical } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

// Test cycle creation isn't built yet — it routes to its list page and lets
// the "coming soon" toast set expectations rather than 404ing or silently
// doing nothing. Organisation creation deep-links into the create sheet.
export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button className="cursor-pointer" asChild>
        <Link href="/admin/organisations?new=1">
          <Building2 />
          New Organisation
        </Link>
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
