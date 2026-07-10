"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import {
  companyProfileFormSchema,
  type CompanyProfileFormValues,
} from "@/lib/validations/company-profile"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

export interface UpdateCompanyProfileResult {
  error?: string
  success?: boolean
}

export async function updateCompanyProfile(
  id: string,
  values: CompanyProfileFormValues
): Promise<UpdateCompanyProfileResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = companyProfileFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid company profile." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("company_profile")
    .update({
      name: parsed.data.name,
      contact_email: parsed.data.contactEmail?.trim() || null,
      contact_phone: parsed.data.contactPhone?.trim() || null,
      address: parsed.data.address?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { error: "Could not save the company profile. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "update_company_profile",
    "company_profile",
    id,
    { name: parsed.data.name }
  )

  revalidatePath("/admin/settings/company-profile")

  return { success: true }
}

export interface UploadLogoResult {
  error?: string
  success?: boolean
  logoUrl?: string
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]

export async function uploadCompanyLogo(id: string, formData: FormData): Promise<UploadLogoResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const file = formData.get("file")
  if (!(file instanceof File)) return { error: "No file was uploaded." }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only PNG, JPEG, WebP, or SVG images are supported." }
  }
  if (file.size > MAX_LOGO_BYTES) return { error: "The file is too large (max 2MB)." }

  const supabase = await createClient()
  const ext = file.name.split(".").pop()?.toLowerCase() || "png"
  const path = `logo-${Date.now()}.${ext}`

  // upsert:true would make Postgres plan this as INSERT ... ON CONFLICT DO
  // UPDATE, which requires a SELECT-visibility check on the (potentially)
  // conflicting row — but the branding bucket intentionally has no SELECT
  // policy (a public bucket doesn't need one for object GETs, and adding one
  // would grant unrestricted listing, which the security advisor flags). The
  // Date.now()-based path is already unique per upload, so no upsert needed.
  const { error: uploadError } = await supabase.storage
    .from("branding")
    .upload(path, file, { contentType: file.type })

  if (uploadError) {
    return { error: `Could not upload the logo: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("branding").getPublicUrl(path)

  // .select().single() so a non-matching id surfaces as an error (PGRST116)
  // instead of silently updating zero rows — plain .update().eq() has no
  // error for that case, which is how this failed silently before.
  const { data: updated, error: dbError } = await supabase
    .from("company_profile")
    .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (dbError || !updated) {
    return { error: `The logo uploaded but could not be saved: ${dbError?.message ?? "profile not found"}` }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "upload_company_logo",
    "company_profile",
    id,
    { path }
  )

  revalidatePath("/admin/settings/company-profile")

  return { success: true, logoUrl: publicUrl }
}
