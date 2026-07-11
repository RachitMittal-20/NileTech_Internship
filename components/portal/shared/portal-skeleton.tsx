import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// shadcn's Skeleton with the shimmer sweep layered on top, used across every
// Portal loading state.
export function PortalSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("skeleton-shimmer", className)} {...props} />
}
