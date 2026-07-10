"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import type { EmailTemplateType } from "@/lib/email/template-engine"

export interface SaveEmailTemplateResult {
  error?: string
  success?: boolean
}

export async function saveEmailTemplate(
  type: EmailTemplateType,
  subject: string,
  body: string
): Promise<SaveEmailTemplateResult> {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { error: "You don't have permission to do this." }
  }

  const trimmedSubject = subject.trim()
  const trimmedBody = body.trim()
  if (!trimmedSubject || !trimmedBody) {
    return { error: "Subject and body are both required." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("email_templates")
    .upsert(
      { type, subject: trimmedSubject, body_html: trimmedBody, updated_at: new Date().toISOString() },
      { onConflict: "type" }
    )

  if (error) {
    return { error: "Could not save the template. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "update_email_template",
    "email_templates",
    type,
    { type }
  )

  revalidatePath("/admin/settings/email-templates")

  return { success: true }
}
