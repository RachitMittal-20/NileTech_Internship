"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { format, isSameMonth, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { StatusBadge } from "@/components/admin/test-cycles/status-badge"
import { Button } from "@/components/ui/button"
import type { PortalAppointment } from "@/lib/data/portal-appointments"

export function AppointmentsCalendar({ appointments }: { appointments: PortalAppointment[] }) {
  const prefersReducedMotion = useReducedMotion()
  const upcoming = appointments.find((a) => new Date(a.scheduledDate) >= new Date(new Date().toDateString()))
  const [month, setMonth] = useState(() => (upcoming ? new Date(upcoming.scheduledDate) : new Date()))
  const [direction, setDirection] = useState(0)

  const appointmentDates = useMemo(() => appointments.map((a) => new Date(a.scheduledDate)), [appointments])

  function goToMonth(next: Date) {
    setDirection(next > month ? 1 : -1)
    setMonth(next)
  }

  const monthAppointments = appointments.filter((a) => isSameMonth(new Date(a.scheduledDate), month))

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between px-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => goToMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{format(month, "MMMM yyyy")}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => goToMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={format(month, "yyyy-MM")}
              custom={direction}
              initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <Calendar
                mode="single"
                month={month}
                onMonthChange={goToMonth}
                selected={undefined}
                modifiers={{ appointment: appointmentDates }}
                modifiersClassNames={{ appointment: "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent" }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">{format(month, "MMMM")} appointments</h2>
        {monthAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No testing scheduled this month.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {monthAppointments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {format(new Date(a.scheduledDate), "EEEE, MMMM d")}
                    {isSameDay(new Date(a.scheduledDate), new Date()) ? " · Today" : ""}
                  </span>
                  {a.location ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {a.location}
                    </span>
                  ) : null}
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
