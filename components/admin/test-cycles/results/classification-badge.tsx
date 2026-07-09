import { CheckCircle2, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ClassificationResult } from "@/lib/classification"

export function ClassificationBadge({
  result,
  overrideReason,
}: {
  result: ClassificationResult | null
  overrideReason?: string
}) {
  if (!result) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Pending
      </Badge>
    )
  }

  const badge = (
    <Badge
      variant={result.flagged ? "destructive" : "secondary"}
      className="gap-1"
    >
      {result.flagged ? <TriangleAlert className="size-3" /> : <CheckCircle2 className="size-3" />}
      {result.label}
    </Badge>
  )

  if (!result.overridden || !overrideReason) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>Overridden: {overrideReason}</TooltipContent>
    </Tooltip>
  )
}
