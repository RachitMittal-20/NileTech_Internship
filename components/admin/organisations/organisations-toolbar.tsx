"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  OrganisationFormSheet,
  useOrganisationFormSheet,
} from "@/components/admin/organisations/organisation-form-sheet"
import type { OrganisationStatusFilter } from "@/lib/data/organisations"

export function OrganisationsToolbar({
  initialQuery,
  status,
}: {
  initialQuery: string
  status: OrganisationStatusFilter
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const sheet = useOrganisationFormSheet()

  // Lets the dashboard's "New Organization" quick action deep-link straight
  // into the create sheet via /admin/organisations?new=1.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      sheet.openCreate()
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(params.toString() ? `?${params.toString()}` : "?", { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set("q", query.trim())
      } else {
        params.delete("q")
      }
      params.set("page", "1")
      router.push(`?${params.toString()}`)
    }, 300)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function onStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or contact..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="cursor-pointer" onClick={sheet.openCreate}>
        <Plus />
        New Organization
      </Button>

      <OrganisationFormSheet open={sheet.open} onOpenChange={sheet.setOpen} organisation={null} />
    </div>
  )
}
