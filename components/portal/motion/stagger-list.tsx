"use client"

import { useAutoAnimate } from "@formkit/auto-animate/react"

import { cn } from "@/lib/utils"

// Wraps a list container with auto-animate (smooth enter/exit as rows are
// added/removed, e.g. by search filtering) and gives each row a staggered
// fade-in-up entrance on first mount via tw-animate-css utilities.
// auto-animate respects prefers-reduced-motion on its own (duration collapses
// to near-zero); the per-row stagger below is plain CSS animation, gated by
// the prefers-reduced-motion media query in globals.css / Tailwind's
// motion-reduce: variant on the row wrapper.
export function StaggerList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const [parent] = useAutoAnimate<HTMLDivElement>({ duration: 220, easing: "ease-out" })

  return (
    <div ref={parent} className={className} role="list">
      {children}
    </div>
  )
}

export function StaggerItem({
  index,
  className,
  children,
  as: Tag = "li",
  role,
}: {
  index: number
  className?: string
  children: React.ReactNode
  as?: "li" | "div" | "tr"
  role?: string
}) {
  return (
    <Tag
      role={role}
      className={cn("motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2", className)}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms`, animationDuration: "320ms", animationFillMode: "backwards" }}
    >
      {children}
    </Tag>
  )
}
