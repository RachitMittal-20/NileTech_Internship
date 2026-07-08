"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { getProfile } from "@/lib/supabase/get-profile"

export interface InviteClientAdminInput {
  email: string
  orgId: string
  fullName?: string
}

export interface InviteClientAdminResult {
  error?: string
  success?: boolean
}

// Called from the Portal Access tab on an organization's profile screen.
//
// Uses the Supabase Admin API (service role) to create the auth user and send
// the invite email in one call, then creates the matching `profiles` row.
// If the profile insert fails after the invite email has already gone out,
// the auth user is rolled back so retrying doesn't collide on "already exists".
export async function inviteClientAdmin({
  email,
  orgId,
  fullName,
}: InviteClientAdminInput): Promise<InviteClientAdminResult> {
  const callerProfile = await getProfile()

  if (!callerProfile || callerProfile.role !== "admin") {
    return { error: "You don't have permission to invite users." }
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !orgId) {
    return { error: "Email and organization are required." }
  }

  const adminClient = createAdminClient()

  const { data: org } = await adminClient
    .from("organisations")
    .select("id")
    .eq("id", orgId)
    .single()

  if (!org) {
    return { error: "That organization no longer exists." }
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    data: fullName ? { full_name: fullName } : undefined,
  })

  if (error || !data.user) {
    return { error: error?.message ?? "Could not send the invite." }
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: data.user.id,
    role: "client_admin",
    org_id: orgId,
    full_name: fullName ?? null,
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id)
    return { error: "Could not finish setting up the account. Try again." }
  }

  await logAudit(
    { id: callerProfile.id, role: callerProfile.role },
    "invite_client_admin",
    "profiles",
    data.user.id,
    { email: normalizedEmail, org_id: orgId }
  )

  revalidatePath(`/admin/organisations/${orgId}`)

  return { success: true }
}
