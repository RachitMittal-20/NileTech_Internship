"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bell, X } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotificationBanner({ unreadCount }: { unreadCount: number }) {
  const [dismissed, setDismissed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const show = unreadCount > 0 && !dismissed

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          key="notification-banner"
          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Bell className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
              <p className="text-sm text-foreground">
                You have <span className="font-medium">{unreadCount}</span> unread notification
                {unreadCount === 1 ? "" : "s"}.{" "}
                <Link href="/portal/notifications" className="font-medium text-accent underline underline-offset-2">
                  View all
                </Link>
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss notification banner"
            >
              <X className="size-4" />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
