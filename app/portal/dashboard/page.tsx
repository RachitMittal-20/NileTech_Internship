import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, CalendarClock, CalendarCheck, ClipboardCheck, Users } from "lucide-react"

import { PortalStatCard, PortalStatCardStatic } from "@/components/portal/portal-stat-card"
import { NotificationBanner } from "@/components/portal/notification-banner"
import { Button } from "@/components/ui/button"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalDashboardData } from "@/lib/data/portal-dashboard"
import { getUnreadNotificationCount } from "@/lib/data/portal"

export const metadata: Metadata = {
  title: "Dashboard — Strong Path Portal",
}

export default async function PortalDashboardPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const [data, unreadCount] = await Promise.all([
    getPortalDashboardData(orgId),
    getUnreadNotificationCount(orgId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <NotificationBanner unreadCount={unreadCount} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your organization&apos;s testing program.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard icon={Users} label="Total employees" value={data.totalEmployees} />
        <PortalStatCardStatic
          icon={CalendarCheck}
          label="Last test date"
          value={data.lastTestDate ? format(new Date(data.lastTestDate), "MMM d, yyyy") : "No tests yet"}
        />
        <PortalStatCardStatic
          icon={CalendarClock}
          label="Next scheduled test"
          value={data.nextScheduledDate ? format(new Date(data.nextScheduledDate), "MMM d, yyyy") : "None scheduled"}
        />
        {data.latestResults ? (
          <PortalStatCard
            icon={ClipboardCheck}
            label={`Flagged in latest cycle (${format(new Date(data.latestResults.scheduledDate), "MMM d")})`}
            value={data.latestResults.flaggedCount}
            tone={data.latestResults.flaggedCount > 0 ? "warning" : "default"}
          />
        ) : (
          <PortalStatCardStatic icon={ClipboardCheck} label="Latest results" value="No results yet" />
        )}
      </div>

      {data.latestResults ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              Results from {format(new Date(data.latestResults.scheduledDate), "MMMM d, yyyy")} are ready
            </p>
            <p className="text-sm text-muted-foreground">
              {data.latestResults.clearCount} clear · {data.latestResults.flaggedCount} flagged
              {data.latestResults.pendingCount > 0 ? ` · ${data.latestResults.pendingCount} pending` : ""}
            </p>
          </div>
          <Button asChild className="cursor-pointer">
            <Link href="/portal/results">
              View results
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
