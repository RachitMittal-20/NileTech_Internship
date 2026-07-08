import { Suspense } from "react"
import type { Metadata } from "next"

import {
  ActiveCyclesStat,
  EmployeesStat,
  OrganisationsStat,
  TestsCompletedStat,
} from "@/components/admin/dashboard-stats"
import { QuickActions } from "@/components/admin/quick-actions"
import { RecentActivity, RecentActivitySkeleton } from "@/components/admin/recent-activity"
import { StatCardSkeleton } from "@/components/admin/stat-card"
import { UpcomingCycles, UpcomingCyclesSkeleton } from "@/components/admin/upcoming-cycles"

export const metadata: Metadata = {
  title: "Dashboard — Strong Path Admin",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          An overview of testing activity across every client organisation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatCardSkeleton />}>
          <OrganisationsStat />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <EmployeesStat />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <ActiveCyclesStat />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <TestsCompletedStat />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
        <Suspense fallback={<UpcomingCyclesSkeleton />}>
          <UpcomingCycles />
        </Suspense>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Quick actions</h2>
        <QuickActions />
      </div>
    </div>
  )
}
