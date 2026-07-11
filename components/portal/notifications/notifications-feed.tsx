"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { format } from "date-fns"
import { BellOff, CheckCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortalEmptyState } from "@/components/portal/shared/portal-empty-state"
import { markAllNotificationsRead } from "@/lib/actions/portal-notifications"
import type { Tables } from "@/types/database"

export function NotificationsFeed({ notifications }: { notifications: Tables<"notifications">[] }) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState(notifications)

  const unreadCount = items.filter((n) => !n.read).length

  function onMarkAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (result.error) {
        toast.error(result.error)
        return
      }
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <PortalEmptyState
        icon={<BellOff strokeWidth={1.5} />}
        title="No notifications yet"
        description="You'll be notified here when there's something new — results ready, upcoming testing, and more."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onMarkAllRead}
          disabled={isPending || unreadCount === 0}
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
          Mark all read
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((n) => (
            <motion.li
              key={n.id}
              layout
              initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]"
            >
              <div className="flex items-start gap-3">
                {!n.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" /> : null}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  {n.body ? <span className="text-sm text-muted-foreground">{n.body}</span> : null}
                  <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "MMM d, yyyy · h:mm a")}</span>
                </div>
              </div>
              {!n.read ? (
                <Badge variant="secondary" className="shrink-0">
                  New
                </Badge>
              ) : null}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
