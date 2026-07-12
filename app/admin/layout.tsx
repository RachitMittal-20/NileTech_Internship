import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import { AdminPageTransition } from "@/components/admin/page-transition"
import { BreadcrumbLabelProvider } from "@/components/admin/breadcrumb-label-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProfile } from "@/lib/supabase/get-profile"

// Defense in depth: middleware already gates /admin/*, but Server Components
// re-check here too so this layout is safe even if ever rendered without
// going through middleware (e.g. a misconfigured matcher).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== "admin") {
    redirect("/403")
  }

  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <BreadcrumbLabelProvider>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar />
        <SidebarInset className="admin-bg">
          <SiteHeader profile={profile} />
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <AdminPageTransition>{children}</AdminPageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbLabelProvider>
  )
}
