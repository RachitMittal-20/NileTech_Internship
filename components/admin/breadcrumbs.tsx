"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { adminNavItems } from "@/components/admin/nav-config"
import { useBreadcrumbLabelContext } from "@/components/admin/breadcrumb-label-context"

const LABELS: Record<string, string> = Object.fromEntries(
  adminNavItems.map((item) => [item.url.split("/").pop() ?? "", item.title])
)

function toLabel(segment: string) {
  return (
    LABELS[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const overrideLabels = useBreadcrumbLabelContext()?.labels ?? {}
  const segments = pathname.split("/").filter(Boolean).slice(1) // drop leading "admin"

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin/dashboard">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/admin/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          const label = overrideLabels[segment] ?? toLabel(segment)

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
