"use client"

import Link from "next/link"
import { Building2, FlaskConical } from "lucide-react"

import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button className="cursor-pointer" asChild>
        <Link href="/admin/organisations?new=1">
          <Building2 />
          New Organisation
        </Link>
      </Button>
      <Button variant="outline" className="cursor-pointer" asChild>
        <Link href="/admin/test-cycles/new">
          <FlaskConical />
          New Test Cycle
        </Link>
      </Button>
    </div>
  )
}
