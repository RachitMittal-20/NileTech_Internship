"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock, ClipboardCheck, ClipboardList, FlaskConical, MapPin, Pencil, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { StatusPipeline } from "@/components/admin/test-cycles/status-pipeline"
import { AdvanceStatusDialog } from "@/components/admin/test-cycles/advance-status-dialog"
import { STATUS_ACTION_LABEL, nextStatus, type TestCycleStatus } from "@/lib/test-cycle-status"

// Some stages need a dedicated workspace before the cycle can actually
// advance (recording samples, entering results, reviewing) — for those the
// header links out instead of opening the generic transition confirm dialog.
// The transition itself happens on that page once its work is done.
const STAGE_WORKSPACE: Partial<
  Record<TestCycleStatus, { path: string; label: string; icon: typeof ClipboardList }>
> = {
  testing: { path: "roster", label: "Testing Roster", icon: ClipboardList },
  results_entry: { path: "results", label: "Enter Results", icon: FlaskConical },
  review: { path: "review", label: "Review Results", icon: ClipboardCheck },
  broadcast: { path: "broadcast", label: "Delivery Log", icon: Send },
}

export function CycleHeader({
  cycleId,
  orgName,
  scheduledDate,
  location,
  status,
}: {
  cycleId: string
  orgName: string
  scheduledDate: string
  location: string | null
  status: TestCycleStatus
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const upcoming = nextStatus(status)
  const workspace = STAGE_WORKSPACE[status]

  return (
    <div className="flex flex-col gap-6 border-b border-border pb-6">
      <SetBreadcrumbLabel
        segment={cycleId}
        label={`${orgName} · ${format(new Date(scheduledDate), "MMM d, yyyy")}`}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{orgName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {format(new Date(scheduledDate), "MMM d, yyyy")}
            </span>
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {location}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "scheduled" ? (
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link href={`/admin/test-cycles/${cycleId}/edit`}>
                <Pencil />
                Edit
              </Link>
            </Button>
          ) : null}
          {workspace ? (
            <Button className="cursor-pointer" asChild>
              <Link href={`/admin/test-cycles/${cycleId}/${workspace.path}`}>
                <workspace.icon />
                {workspace.label}
              </Link>
            </Button>
          ) : upcoming ? (
            <Button className="cursor-pointer" onClick={() => setConfirmOpen(true)}>
              {STATUS_ACTION_LABEL[status]}
            </Button>
          ) : null}
        </div>
      </div>

      <StatusPipeline status={status} />

      {upcoming && !workspace ? (
        <AdvanceStatusDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          cycleId={cycleId}
          from={status}
          to={upcoming}
        />
      ) : null}
    </div>
  )
}
