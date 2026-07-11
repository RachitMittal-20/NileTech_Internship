import { Skeleton } from "@/components/ui/skeleton"

// Generic loading shape for admin list/table pages: title + toolbar + N row
// placeholders. Used by route-level loading.tsx files so navigation shows
// something intentional instead of a blank screen while data loads.
export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormPageSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex max-w-xl flex-col gap-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

export function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
