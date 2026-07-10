"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Download, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface OrgOption {
  id: string
  name: string
}

export function ReportsFilters({
  organisations,
  dateFrom,
  dateTo,
  orgId,
}: {
  organisations: OrgOption[]
  dateFrom: string
  dateTo: string
  orgId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`?${params.toString()}`)
  }

  const hasFilters = Boolean(dateFrom || dateTo || orgId)
  const exportQuery = searchParams.toString()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("w-44 cursor-pointer justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
            >
              <CalendarIcon className="size-4" />
              {dateFrom ? format(parseISO(dateFrom), "MMM d, yyyy") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={dateFrom ? parseISO(dateFrom) : undefined}
              onSelect={(d) => updateParam("from", d ? format(d, "yyyy-MM-dd") : null)}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("w-44 cursor-pointer justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
            >
              <CalendarIcon className="size-4" />
              {dateTo ? format(parseISO(dateTo), "MMM d, yyyy") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={dateTo ? parseISO(dateTo) : undefined}
              onSelect={(d) => updateParam("to", d ? format(d, "yyyy-MM-dd") : null)}
            />
          </PopoverContent>
        </Popover>

        <Select value={orgId || "all"} onValueChange={(v) => updateParam("org", v === "all" ? null : v)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All organisations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organisations</SelectItem>
            {organisations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground"
            onClick={() => router.push("?")}
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <a href={`/admin/reports/export/csv?${exportQuery}`} download>
            <Download className="size-3.5" />
            Export CSV
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <a href={`/admin/reports/export/pdf?${exportQuery}`} target="_blank" rel="noreferrer">
            <FileText className="size-3.5" />
            Export PDF
          </a>
        </Button>
      </div>
    </div>
  )
}
