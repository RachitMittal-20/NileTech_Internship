import { LogoMark } from "@/components/brand/logo-mark"
import { PortalUserMenu } from "@/components/portal/portal-user-menu"
import { MobileMenuButton } from "@/components/portal/mobile-menu-button"
import type { Tables } from "@/types/database"

export function PortalHeader({
  profile,
  orgName,
}: {
  profile: Tables<"profiles">
  orgName: string
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileMenuButton />
        <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 sm:flex">
          <LogoMark className="size-5 text-accent" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">{orgName}</span>
          <span className="text-xs text-muted-foreground">Client Portal</span>
        </div>
      </div>
      <PortalUserMenu profile={profile} />
    </header>
  )
}
