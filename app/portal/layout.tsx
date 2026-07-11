import { redirect } from "next/navigation"

import { PortalSidebar, PortalMobileSidebar } from "@/components/portal/portal-sidebar"
import { PortalHeader } from "@/components/portal/portal-header"
import { PageTransition } from "@/components/portal/motion/page-transition"
import { MobileNavProvider } from "@/components/portal/mobile-nav-context"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalOrg } from "@/lib/data/portal"

// Defense in depth: middleware already gates /portal/*, but Server Components
// re-check here too so this layout is safe even if ever rendered without
// going through middleware (e.g. a misconfigured matcher).
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== "client_admin") {
    redirect("/403")
  }

  if (!profile.org_id) {
    redirect("/403")
  }

  const org = await getPortalOrg(profile.org_id)

  return (
    <MobileNavProvider>
      <div className="flex min-h-dvh bg-background">
        <PortalSidebar />
        <PortalMobileSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader profile={profile} orgName={org?.name ?? "Your organization"} />
          <main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  )
}
