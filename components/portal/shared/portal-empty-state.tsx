import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Portal's warmer take on the admin EmptyState: softer surface, rounder
// corners, and a gentle floating icon (CSS keyframe, respects
// prefers-reduced-motion via the .animate-float rule in globals.css).
export function PortalEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center shadow-sm",
        className
      )}
    >
      <div className="animate-float flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent [&_svg]:size-7">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
