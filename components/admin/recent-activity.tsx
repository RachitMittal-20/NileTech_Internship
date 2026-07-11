import { formatDistanceToNow } from "date-fns"
import { History } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { humanizeAuditAction } from "@/lib/format-audit"
import { createClient } from "@/lib/supabase/server"

export async function RecentActivity() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("audit_log")
    .select("id, action, entity, created_at, actor:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <EmptyState
            icon={<History strokeWidth={1.5} />}
            title="No activity yet"
            description="Actions taken across the platform will show up here as they happen."
            className="border-none py-8"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {data.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground">
                    {humanizeAuditAction(entry.action, entry.entity)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.actor?.full_name ?? "System"}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
