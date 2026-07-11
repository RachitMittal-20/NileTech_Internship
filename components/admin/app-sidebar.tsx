"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

import { LogoMark } from "@/components/brand/logo-mark"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { adminNavItems } from "@/components/admin/nav-config"

export function AppSidebar() {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Strong Path Diagnostics">
              <Link href="/admin/dashboard">
                <LogoMark className="size-6 shrink-0" />
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-semibold text-sidebar-foreground">
                    Strong Path
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Admin System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive =
                  item.url === "/admin/dashboard"
                    ? pathname === item.url
                    : pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="relative data-active:bg-transparent data-active:hover:bg-transparent"
                    >
                      <Link href={item.url}>
                        {isActive ? (
                          <motion.span
                            layoutId="admin-nav-pill"
                            className="absolute inset-0 rounded-md bg-sidebar-accent"
                            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 32 }}
                          />
                        ) : null}
                        <item.icon strokeWidth={1.75} className="relative z-10" />
                        <span className="relative z-10">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
