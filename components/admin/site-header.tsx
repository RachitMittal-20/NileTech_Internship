import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs"
import { UserMenu } from "@/components/admin/user-menu"
import type { Tables } from "@/types/database"

export function SiteHeader({ profile }: { profile: Tables<"profiles"> }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1 cursor-pointer" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1">
        <AdminBreadcrumbs />
      </div>
      <UserMenu profile={profile} />
    </header>
  )
}
