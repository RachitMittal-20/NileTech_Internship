"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"

export interface MarkAllReadResult {
  error?: string
  success?: boolean
}

export async function markAllNotificationsRead(): Promise<MarkAllReadResult> {
  const profile = await getProfile()
  if (!profile || profile.role !== "client_admin" || !profile.org_id) {
    return { error: "You don't have permission to do this." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("org_id", profile.org_id)
    .eq("read", false)

  if (error) {
    return { error: `Could not mark notifications as read: ${error.message}` }
  }

  revalidatePath("/portal/notifications")
  revalidatePath("/portal/dashboard")

  return { success: true }
}
