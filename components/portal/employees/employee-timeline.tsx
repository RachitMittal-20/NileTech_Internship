"use client"

import { motion, useReducedMotion } from "framer-motion"
import { format } from "date-fns"
import { History, MapPin } from "lucide-react"

import { ResultStatusBadge } from "@/components/portal/results/result-status-badge"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import type { TimelineEntry } from "@/lib/data/portal-employee"

export function EmployeeTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  const prefersReducedMotion = useReducedMotion()

  if (timeline.length === 0) {
    return (
      <PortalEmptyState
        icon={<History strokeWidth={1.5} />}
        title="No testing history yet"
        description="Results will appear here once a test cycle has been completed and released."
      />
    )
  }

  return (
    <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
      {timeline.map((entry, index) => (
        <motion.li
          key={entry.cycleId}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : Math.min(index, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <span className="absolute -left-7.25 top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-background bg-accent" />

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {format(new Date(entry.scheduledDate), "MMMM d, yyyy")}
              </span>
              {entry.location ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {entry.location}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col divide-y divide-border">
              {entry.results.map((result) => (
                <div key={result.testTypeName} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{result.testTypeName}</span>
                    <ResultStatusBadge classification={result.classification ? (result.classification.flagged ? "flagged" : "clear") : null} />
                  </div>
                  {result.fields.length > 0 ? (
                    <dl className="flex flex-wrap gap-x-5 gap-y-1">
                      {result.fields.map((f) => (
                        <div key={f.label} className="flex items-baseline gap-1 text-xs">
                          <dt className="text-muted-foreground">{f.label}:</dt>
                          <dd className="font-medium text-foreground">
                            {f.value}
                            {f.unit ? ` ${f.unit}` : ""}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
