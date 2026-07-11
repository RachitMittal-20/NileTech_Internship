import { format } from "date-fns"

import { Inbox } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { StaggerList, StaggerItem } from "@/components/portal/motion/stagger-list"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import type { PortalCycleRequest } from "@/lib/data/portal-requests"

const STATUS_VARIANT: Record<PortalCycleRequest["status"], "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  scheduled: "default",
  rejected: "destructive",
}

const STATUS_LABEL: Record<PortalCycleRequest["status"], string> = {
  pending: "Pending review",
  approved: "Approved",
  scheduled: "Scheduled",
  rejected: "Declined",
}

function describeScope(scope: PortalCycleRequest["employeeScope"]) {
  const s = scope as { type?: string; count?: number; employeeIds?: string[] } | null
  if (!s?.type) return "—"
  if (s.type === "all") return "All employees"
  if (s.type === "count") return `~${s.count} employees`
  if (s.type === "subset") return `${s.employeeIds?.length ?? 0} selected employees`
  return "—"
}

export function ExistingRequestsList({ requests }: { requests: PortalCycleRequest[] }) {
  if (requests.length === 0) {
    return (
      <PortalEmptyState
        icon={<Inbox strokeWidth={1.5} />}
        title="No requests yet"
        description="Submitted testing requests will show up here with their status."
      />
    )
  }

  return (
    <StaggerList className="flex flex-col gap-3">
      {requests.map((r, index) => (
        <StaggerItem as="div" index={index} key={r.id} role="listitem">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{r.testTypeNames.join(", ")}</span>
              <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Preferred:{" "}
                {r.requestedDates.map((d) => format(new Date(d), "MMM d")).join(", ") || "—"}
              </span>
              <span>{describeScope(r.employeeScope)}</span>
              <span>Requested {format(new Date(r.createdAt), "MMM d, yyyy")}</span>
            </div>
            {r.notes ? <p className="text-sm text-muted-foreground">{r.notes}</p> : null}
          </div>
        </StaggerItem>
      ))}
    </StaggerList>
  )
}
