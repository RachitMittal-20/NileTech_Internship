"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Building2, CheckCircle2, Loader2, RotateCw, TriangleAlert, Users } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyState } from "@/components/shared/empty-state"
import { resendBroadcast } from "@/lib/actions/broadcast"
import type { BroadcastLogEntry } from "@/lib/data/broadcast"

export function DeliveryLogTable({ log }: { log: BroadcastLogEntry[] }) {
  const router = useRouter()
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onResend(id: string) {
    setResendingId(id)
    startTransition(async () => {
      const result = await resendBroadcast(id)
      setResendingId(null)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Resent.")
      router.refresh()
    })
  }

  if (log.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 strokeWidth={1.5} />}
        title="No broadcasts sent yet"
        description="Every send attempt for this cycle will be recorded here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 text-left font-medium text-foreground">Recipient</th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground">Type</th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground">Status</th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground">Sent</th>
            <th className="w-24 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {log.map((entry) => (
            <tr key={entry.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {entry.employeeName ?? entry.sentTo ?? "Unknown recipient"}
                  </span>
                  {entry.sentTo ? (
                    <span className="text-xs text-muted-foreground">{entry.sentTo}</span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {entry.recipientType === "org" ? (
                    <Building2 className="size-3.5" />
                  ) : (
                    <Users className="size-3.5" />
                  )}
                  {entry.recipientType === "org" ? "Aggregate" : "Individual"}
                </span>
              </td>
              <td className="px-4 py-2.5">
                {entry.status === "sent" ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    Sent
                  </Badge>
                ) : entry.status === "failed" ? (
                  entry.error ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="destructive" className="gap-1">
                          <TriangleAlert className="size-3" />
                          Failed
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{entry.error}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <TriangleAlert className="size-3" />
                      Failed
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Pending
                  </Badge>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {entry.sentAt ? format(new Date(entry.sentAt), "MMM d, yyyy h:mm a") : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {entry.status === "failed" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 cursor-pointer gap-1.5 text-xs"
                    disabled={isPending && resendingId === entry.id}
                    onClick={() => onResend(entry.id)}
                  >
                    {isPending && resendingId === entry.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="size-3.5" />
                    )}
                    Resend
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
