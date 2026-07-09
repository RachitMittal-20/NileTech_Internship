"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock, ClipboardList, MapPin, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { StatusPipeline } from "@/components/admin/test-cycles/status-pipeline"
import { AdvanceStatusDialog } from "@/components/admin/test-cycles/advance-status-dialog"
import { STATUS_ACTION_LABEL, nextStatus, type TestCycleStatus } from "@/lib/test-cycle-status"

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
          {status === "testing" ? (
            <Button className="cursor-pointer" asChild>
              <Link href={`/admin/test-cycles/${cycleId}/roster`}>
                <ClipboardList />
                Testing Roster
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

      {upcoming && status !== "testing" ? (
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
