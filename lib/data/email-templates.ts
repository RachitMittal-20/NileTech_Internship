import "server-only"

import { createClient } from "@/lib/supabase/server"
import { DEFAULT_TEMPLATES, type EmailTemplateType } from "@/lib/email/template-engine"

export interface EmailTemplateRecord {
  type: EmailTemplateType
  subject: string
  body: string
  isCustomized: boolean
}

export async function getEmailTemplate(type: EmailTemplateType): Promise<EmailTemplateRecord> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("email_templates")
    .select("subject, body_html")
    .eq("type", type)
    .maybeSingle()

  if (data) {
    return { type, subject: data.subject, body: data.body_html, isCustomized: true }
  }

  return { type, ...DEFAULT_TEMPLATES[type], isCustomized: false }
}

export async function getAllEmailTemplates(): Promise<EmailTemplateRecord[]> {
  return Promise.all([getEmailTemplate("broadcast_aggregate"), getEmailTemplate("broadcast_individual")])
}
