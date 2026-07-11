"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

import { LogoMark } from "@/components/brand/logo-mark"
import { portalNavItems } from "@/components/portal/nav-config"
import { cn } from "@/lib/utils"

export function PortalSidebar() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 248 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
      className="sticky top-0 flex h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-16 items-center gap-2.5 px-4">
        <LogoMark className="size-7 shrink-0 text-sidebar-primary" />
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.span
              key="wordmark"
              initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="truncate text-[13px] font-semibold text-sidebar-foreground"
            >
              Strong Path
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {portalNavItems.map((item) => {
          const isActive =
            item.url === "/portal/dashboard" ? pathname === item.url : pathname.startsWith(item.url)

          return (
            <Link
              key={item.url}
              href={item.url}
              title={collapsed ? item.title : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="portal-active-nav"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                />
              ) : null}
              <item.icon strokeWidth={1.75} className="relative z-10 size-4.5 shrink-0" />
              <span className={cn("relative z-10 truncate", collapsed && "sr-only")}>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/60 outline-none transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </motion.aside>
  )
}
