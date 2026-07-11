import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"

import { AppointmentsCalendar } from "@/components/portal/appointments/appointments-calendar"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalAppointments } from "@/lib/data/portal-appointments"

export const metadata: Metadata = {
  title: "Appointments — Strong Path Portal",
}

export default async function PortalAppointmentsPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const appointments = await getPortalAppointments(orgId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Appointments</h1>
        <p className="text-sm text-muted-foreground">Upcoming and past testing dates for your organization.</p>
      </div>

      {appointments.length === 0 ? (
        <PortalEmptyState
          icon={<CalendarDays strokeWidth={1.5} />}
          title="No appointments yet"
          description="Once a test cycle is scheduled, it will appear here."
        />
      ) : (
        <AppointmentsCalendar appointments={appointments} />
      )}
    </div>
  )
}
