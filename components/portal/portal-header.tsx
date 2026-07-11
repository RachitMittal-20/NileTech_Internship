import { LogoMark } from "@/components/brand/logo-mark"
import { PortalUserMenu } from "@/components/portal/portal-user-menu"
import type { Tables } from "@/types/database"

export function PortalHeader({
  profile,
  orgName,
}: {
  profile: Tables<"profiles">
  orgName: string
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10">
          <LogoMark className="size-5 text-accent" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">{orgName}</span>
          <span className="text-xs text-muted-foreground">Client Portal</span>
        </div>
      </div>
      <PortalUserMenu profile={profile} />
    </header>
  )
}
