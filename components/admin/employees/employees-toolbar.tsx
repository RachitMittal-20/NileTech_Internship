"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, Upload } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EmployeesToolbar({
  initialQuery,
  orgFilter,
  organisations,
  showOrgFilter,
  onAdd,
  onBulkUpload,
}: {
  initialQuery: string
  orgFilter: string
  organisations: { id: string; name: string }[]
  showOrgFilter: boolean
  onAdd: () => void
  onBulkUpload: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)

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

  function onOrgChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("org")
    } else {
      params.set("org", value)
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or code..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {showOrgFilter ? (
          <Select value={orgFilter || "all"} onValueChange={onOrgChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organisations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="cursor-pointer" onClick={onBulkUpload}>
          <Upload />
          Bulk Upload
        </Button>
        <Button className="cursor-pointer" onClick={onAdd}>
          <Plus />
          Add Employee
        </Button>
      </div>
    </div>
  )
}
