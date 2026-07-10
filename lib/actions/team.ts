"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { getProfile } from "@/lib/supabase/get-profile"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

export interface InviteAdminInput {
  email: string
  fullName?: string
}

export interface InviteAdminResult {
  error?: string
  success?: boolean
}

// Mirrors lib/actions/invite-client-admin.ts's shape, but for internal
// Strong Path staff (role=admin, no org_id) rather than a client's portal user.
export async function inviteAdmin({ email, fullName }: InviteAdminInput): Promise<InviteAdminResult> {
  const { profile: callerProfile, error: authError } = await requireAdmin()
  if (!callerProfile) return { error: authError }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return { error: "Email is required." }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    data: fullName ? { full_name: fullName } : undefined,
  })

  if (error || !data.user) {
    return { error: error?.message ?? "Could not send the invite." }
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: data.user.id,
    role: "admin",
    full_name: fullName ?? null,
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id)
    return { error: "Could not finish setting up the account. Try again." }
  }

  await logAudit(
    { id: callerProfile.id, role: callerProfile.role },
    "invite_admin",
    "profiles",
    data.user.id,
    { email: normalizedEmail }
  )

  revalidatePath("/admin/settings/team")

  return { success: true }
}

export interface SetAdminActiveResult {
  error?: string
  success?: boolean
}

export async function setAdminActive(profileId: string, isActive: boolean): Promise<SetAdminActiveResult> {
  const { profile: callerProfile, error: authError } = await requireAdmin()
  if (!callerProfile) return { error: authError }

  if (profileId === callerProfile.id && !isActive) {
    return { error: "You can't deactivate your own account." }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", profileId)
    .eq("role", "admin")

  if (error) {
    return { error: "Could not update that account. Try again." }
  }

  await logAudit(
    { id: callerProfile.id, role: callerProfile.role },
    isActive ? "reactivate_admin" : "deactivate_admin",
    "profiles",
    profileId,
    { is_active: isActive }
  )

  revalidatePath("/admin/settings/team")

  return { success: true }
}
