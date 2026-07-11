import type { Metadata } from "next"

import { NotificationsFeed } from "@/components/portal/notifications/notifications-feed"
import { getProfile } from "@/lib/supabase/get-profile"
import { getPortalNotifications } from "@/lib/data/portal-notifications"

export const metadata: Metadata = {
  title: "Notifications — Strong Path Portal",
}

export default async function PortalNotificationsPage() {
  const profile = await getProfile()
  const orgId = profile!.org_id!

  const notifications = await getPortalNotifications(orgId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">Updates about your organization&apos;s testing program.</p>
      </div>

      <NotificationsFeed notifications={notifications} />
    </div>
  )
}
