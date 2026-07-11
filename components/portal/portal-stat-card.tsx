import type { LucideIcon } from "lucide-react"

import { CountUp } from "@/components/portal/motion/count-up"
import { cn } from "@/lib/utils"

export function PortalStatCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone = "default",
  className,
}: {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  tone?: "default" | "warning"
  className?: string
}) {
  return (
    <div
      className={cn("glass-card flex flex-col gap-3 rounded-2xl p-5", className)}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          tone === "warning" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          <CountUp value={value} />
          {suffix ? <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span> : null}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function PortalStatCardStatic({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn("glass-card flex flex-col gap-3 rounded-2xl p-5", className)}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold tracking-tight text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
