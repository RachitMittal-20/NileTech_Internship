import type { ReactNode } from "react"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/brand/logo-mark"
import { logout } from "@/lib/actions/logout"
import type { Tables } from "@/types/database"

export function DashboardShell({
  profile,
  surfaceLabel,
  children,
}: {
  profile: Tables<"profiles">
  surfaceLabel: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Strong Path {surfaceLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {profile.full_name ?? "Signed in"}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm" className="cursor-pointer">
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  )
}
