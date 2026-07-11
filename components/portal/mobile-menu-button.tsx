"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMobileNav } from "@/components/portal/mobile-nav-context"

export function MobileMenuButton() {
  const { setOpen } = useMobileNav()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="cursor-pointer lg:hidden"
      onClick={() => setOpen(true)}
      aria-label="Open menu"
    >
      <Menu className="size-5" />
    </Button>
  )
}
