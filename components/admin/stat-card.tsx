import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CountUp } from "@/components/portal/motion/count-up"

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number | string
}) {
  return (
    <Card className="glass-card">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {typeof value === "number" ? <CountUp value={value} /> : value}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="glass-card">
      <CardContent className="flex items-center gap-4">
        <Skeleton className="skeleton-shimmer size-10 shrink-0 rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="skeleton-shimmer h-7 w-12" />
          <Skeleton className="skeleton-shimmer h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
