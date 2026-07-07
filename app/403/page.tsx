import Link from "next/link"
import type { Metadata } from "next"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getProfile } from "@/lib/supabase/get-profile"

export const metadata: Metadata = {
  title: "Access denied — Strong Path Diagnostics",
}

export default async function ForbiddenPage() {
  const profile = await getProfile()
  const dashboard = profile?.role === "admin" ? "/admin/dashboard" : "/portal/dashboard"

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">You don&apos;t have access to this page</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account doesn&apos;t have permission to view this section. If you think this is a
          mistake, contact your administrator.
        </p>
      </div>
      <Button asChild>
        <Link href={profile ? dashboard : "/login"}>
          {profile ? "Go to your dashboard" : "Back to sign in"}
        </Link>
      </Button>
    </div>
  )
}
