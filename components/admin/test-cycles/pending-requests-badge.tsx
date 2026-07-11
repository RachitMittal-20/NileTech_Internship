"use client"

import { format } from "date-fns"
import { Inbox } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { PendingCycleRequestSummary } from "@/lib/data/cycle-requests-admin"

export function PendingRequestsBadge({ requests }: { requests: PendingCycleRequestSummary[] }) {
  if (requests.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
          <Inbox className="size-3.5" />
          Requests
          <Badge variant="destructive" className="ml-0.5 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[10px]">
            {requests.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-1 pb-2">
          <p className="text-sm font-medium text-foreground">Incoming testing requests</p>
          <p className="text-xs text-muted-foreground">Submitted by client organizations, awaiting review.</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {requests.slice(0, 8).map((r) => (
            <div key={r.id} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0">
              <span className="text-sm font-medium text-foreground">{r.orgName}</span>
              <span className="text-xs text-muted-foreground">
                Preferred: {r.requestedDates.map((d) => format(new Date(d), "MMM d")).join(", ") || "—"} · Submitted{" "}
                {format(new Date(r.createdAt), "MMM d")}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
