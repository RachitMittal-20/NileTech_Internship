"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { ChevronsLeft, ChevronsRight, X } from "lucide-react"

import { LogoMark } from "@/components/brand/logo-mark"
import { portalNavItems } from "@/components/portal/nav-config"
import { useMobileNav } from "@/components/portal/mobile-nav-context"
import { cn } from "@/lib/utils"

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {portalNavItems.map((item) => {
        const isActive =
          item.url === "/portal/dashboard" ? pathname === item.url : pathname.startsWith(item.url)

        return (
          <Link
            key={item.url}
            href={item.url}
            onClick={onNavigate}
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
  )
}

// Desktop: a sticky, collapsible rail (existing behavior). Rendered only
// lg and up — below that, PortalMobileSidebar takes over as an overlay drawer
// so a 375px phone doesn't lose most of its width to a permanent sidebar.
export function PortalSidebar() {
  const prefersReducedMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 248 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex"
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

      <SidebarNav collapsed={collapsed} />

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

// Mobile: a full-height slide-in drawer with a backdrop, opened via the
// hamburger button in PortalHeader. Below lg only.
export function PortalMobileSidebar() {
  const { open, setOpen } = useMobileNav()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.aside
            initial={prefersReducedMotion ? { x: 0 } : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? { x: 0 } : { x: "-100%" }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34 }}
            className="relative flex h-dvh w-72 max-w-[80vw] flex-col bg-sidebar text-sidebar-foreground"
          >
            <div className="flex h-16 items-center justify-between gap-2.5 px-4">
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-7 shrink-0 text-sidebar-primary" />
                <span className="truncate text-[13px] font-semibold text-sidebar-foreground">Strong Path</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sidebar-foreground/70 outline-none transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            <SidebarNav collapsed={false} onNavigate={() => setOpen(false)} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
