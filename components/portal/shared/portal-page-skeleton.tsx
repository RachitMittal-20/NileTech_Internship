import { PortalSkeleton } from "@/components/portal/shared/portal-skeleton"

// Generic loading shape for Portal pages, used by route-level loading.tsx
// files so navigation shows something intentional instead of a blank screen.
export function PortalDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PortalSkeleton className="h-7 w-56" />
        <PortalSkeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border p-5">
            <PortalSkeleton className="size-10 rounded-xl" />
            <PortalSkeleton className="h-7 w-16" />
            <PortalSkeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <PortalSkeleton className="h-24 w-full rounded-2xl" />
    </div>
  )
}

export function PortalListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PortalSkeleton className="h-7 w-56" />
        <PortalSkeleton className="h-4 w-80" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border p-5"
          >
            <div className="flex flex-col gap-2">
              <PortalSkeleton className="h-4 w-40" />
              <PortalSkeleton className="h-3 w-28" />
            </div>
            <PortalSkeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
