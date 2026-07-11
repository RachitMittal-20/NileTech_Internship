"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ChevronRight, ClipboardCheck, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResultStatusBadge } from "@/components/portal/results/result-status-badge"
import { StaggerList, StaggerItem } from "@/components/portal/motion/stagger-list"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import type { PortalEmployeeResult } from "@/lib/data/portal-results"

type StatusFilter = "all" | "clear" | "flagged" | "pending"

export function EmployeeResultsList({ employees }: { employees: PortalEmployeeResult[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employees.filter((e) => {
      const matchesQuery =
        !q || e.fullName.toLowerCase().includes(q) || (e.employeeCode ?? "").toLowerCase().includes(q)
      const matchesStatus =
        status === "all" ||
        (status === "pending" ? e.latestClassification === null : e.latestClassification === status)
      return matchesQuery && matchesStatus
    })
  }, [employees, query, status])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or employee code..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="clear">All Clear</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <PortalEmptyState
          icon={<ClipboardCheck strokeWidth={1.5} />}
          title="No employees match"
          description="Try a different search term or status filter."
        />
      ) : (
        <StaggerList className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
          {filtered.map((e, index) => (
            <StaggerItem as="div" index={index} key={e.employeeId} role="listitem">
              <Link
                href={`/portal/employees/${e.employeeId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{e.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {e.employeeCode ? `${e.employeeCode} · ` : ""}
                    {e.latestResultDate
                      ? `Last tested ${format(new Date(e.latestResultDate), "MMM d, yyyy")}`
                      : "No results yet"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ResultStatusBadge classification={e.latestClassification} />
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  )
}
