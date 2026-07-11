import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ResultStatusBadge({
  classification,
  className,
}: {
  classification: "clear" | "flagged" | null
  className?: string
}) {
  if (classification === "flagged") {
    return (
      <Badge
        variant="destructive"
        className={cn("motion-safe:animate-pulse gap-1", className)}
      >
        <AlertCircle className="size-3" />
        Flagged
      </Badge>
    )
  }

  if (classification === "clear") {
    return (
      <Badge className={cn("gap-1 border-transparent bg-success/15 text-success hover:bg-success/15", className)}>
        <CheckCircle2 className="size-3" />
        All Clear
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn("gap-1 text-muted-foreground", className)}>
      <Clock className="size-3" />
      Pending
    </Badge>
  )
}
