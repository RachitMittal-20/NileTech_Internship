"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import { organisationFormSchema, type OrganisationFormValues } from "@/lib/validations/organisation"
import type { Tables } from "@/types/database"

export interface OrganisationActionResult {
  error?: string
  success?: boolean
  id?: string
}

function toRow(values: OrganisationFormValues) {
  return {
    name: values.name.trim(),
    contact_name: values.contactName?.trim() || null,
    contact_email: values.contactEmail?.trim() || null,
    contact_phone: values.contactPhone?.trim() || null,
    address: values.address?.trim() || null,
    contract_type: values.contractType || null,
    billing_details: values.billingNotes?.trim() ? { notes: values.billingNotes.trim() } : {},
  }
}

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

export async function getOrganisationById(id: string): Promise<Tables<"organisations"> | null> {
  const { profile } = await requireAdmin()
  if (!profile) return null

  const supabase = await createClient()
  const { data } = await supabase.from("organisations").select("*").eq("id", id).single()
  return data
}

export async function createOrganisation(
  input: OrganisationFormValues
): Promise<OrganisationActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = organisationFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid organization details." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("organisations")
    .insert(toRow(parsed.data))
    .select("id")
    .single()

  if (error || !data) {
    return { error: "Could not create the organization. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "create_organisation",
    "organisations",
    data.id,
    { name: parsed.data.name }
  )

  revalidatePath("/admin/organisations")
  revalidatePath("/admin/dashboard")

  return { success: true, id: data.id }
}

export async function updateOrganisation(
  id: string,
  input: OrganisationFormValues
): Promise<OrganisationActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = organisationFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid organization details." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("organisations").update(toRow(parsed.data)).eq("id", id)

  if (error) {
    return { error: "Could not save changes. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "update_organisation",
    "organisations",
    id,
    { name: parsed.data.name }
  )

  revalidatePath("/admin/organisations")
  revalidatePath(`/admin/organisations/${id}`)

  return { success: true, id }
}

async function setOrganisationStatus(
  id: string,
  status: Tables<"organisations">["status"]
): Promise<OrganisationActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const supabase = await createClient()
  const { error } = await supabase.from("organisations").update({ status }).eq("id", id)

  if (error) {
    return { error: "Could not update the organization status. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    status === "archived" ? "archive_organisation" : "restore_organisation",
    "organisations",
    id,
    { status }
  )

  revalidatePath("/admin/organisations")
  revalidatePath(`/admin/organisations/${id}`)
  revalidatePath("/admin/dashboard")

  return { success: true, id }
}

export async function archiveOrganisation(id: string): Promise<OrganisationActionResult> {
  return setOrganisationStatus(id, "archived")
}

export async function restoreOrganisation(id: string): Promise<OrganisationActionResult> {
  return setOrganisationStatus(id, "active")
}

// Fully revokes a client_admin's portal access by deleting their auth user —
// profiles.id -> auth.users.id cascades, so the profile row is removed too.
// Uses the admin client because deleting auth users requires the service role.
export async function revokePortalAccess(profileId: string): Promise<OrganisationActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const adminClient = createAdminClient()

  const { data: target } = await adminClient
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", profileId)
    .single()

  if (!target || target.role !== "client_admin") {
    return { error: "That portal user no longer exists." }
  }

  const { error } = await adminClient.auth.admin.deleteUser(profileId)

  if (error) {
    return { error: "Could not revoke access. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "revoke_portal_access",
    "profiles",
    profileId,
    { org_id: target.org_id }
  )

  if (target.org_id) {
    revalidatePath(`/admin/organisations/${target.org_id}`)
  }

  return { success: true }
}
