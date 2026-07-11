import type { Metadata } from "next"
import { format } from "date-fns"
import { Download, FlaskConical, MapPin, Users } from "lucide-react"

import { StatusBadge } from "@/components/admin/test-cycles/status-badge"
import { StaggerList, StaggerItem } from "@/components/portal/motion/stagger-list"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import { Button } from "@/components/ui/button"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalCycles } from "@/lib/data/portal-cycles"

export const metadata: Metadata = {
  title: "Test Cycles — Strong Path Portal",
}

export default async function PortalCyclesPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const cycles = await getPortalCycles(orgId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Test Cycles</h1>
        <p className="text-sm text-muted-foreground">
          Every testing cycle scheduled for your organization, past and upcoming.
        </p>
      </div>

      {cycles.length === 0 ? (
        <PortalEmptyState
          icon={<FlaskConical strokeWidth={1.5} />}
          title="No test cycles yet"
          description="Request testing to get your first cycle scheduled."
        />
      ) : (
        <StaggerList className="flex flex-col gap-3">
          {cycles.map((cycle, index) => (
            <StaggerItem as="div" index={index} key={cycle.id} role="listitem">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {format(new Date(cycle.scheduledDate), "MMMM d, yyyy")}
                    </span>
                    <StatusBadge status={cycle.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {cycle.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {cycle.location}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {cycle.participationCount} tested
                    </span>
                    <span>{cycle.testTypeNames.join(", ") || "No test types set"}</span>
                  </div>
                </div>

                {cycle.reportAvailable ? (
                  <Button asChild variant="outline" size="sm" className="w-fit cursor-pointer">
                    <a href={`/portal/cycles/${cycle.id}/report`} target="_blank" rel="noreferrer">
                      <Download className="size-3.5" />
                      Aggregate report
                    </a>
                  </Button>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  )
}
