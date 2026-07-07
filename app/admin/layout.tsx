import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
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

  return (
    <DashboardShell profile={profile} surfaceLabel="Admin">
      {children}
    </DashboardShell>
  )
}
