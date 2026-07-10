import "server-only"

import { format } from "date-fns"

import { getEmailTemplate } from "@/lib/data/email-templates"
import { getCompanyProfile } from "@/lib/data/company-profile"
import { renderTemplate } from "@/lib/email/template-engine"

// Hardcoded for now — becomes configurable from Settings > Company Profile
// in a later prompt if a dedicated footer field is added; the brand name
// itself is already pulled from company_profile.
function buildFooter(companyName: string) {
  return `
    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
      ${companyName} · This is an automated message, please do not reply directly to this email.
      If you have questions about these results, please contact your account administrator.
    </p>
  `
}

function textToHtmlParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0f1f38;">${para.replace(/\n/g, "<br/>")}</p>`)
    .join("")
}

export async function buildBroadcastEmail({
  orgName,
  cycleDate,
  recipientName,
  isAggregate,
}: {
  orgName: string
  cycleDate: string
  recipientName: string
  isAggregate: boolean
}): Promise<{ subject: string; html: string }> {
  const [template, company] = await Promise.all([
    getEmailTemplate(isAggregate ? "broadcast_aggregate" : "broadcast_individual"),
    getCompanyProfile(),
  ])

  const vars = {
    employee_name: recipientName,
    org_name: orgName,
    cycle_date: format(new Date(cycleDate), "MMMM d, yyyy"),
  }

  const subject = renderTemplate(template.subject, vars)
  const bodyText = renderTemplate(template.body, vars)

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <div style="background:#0b2545;border-radius:8px 8px 0 0;padding:20px 24px;${company.logoUrl ? "display:flex;align-items:center;gap:10px;" : ""}">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${company.name}" height="28" style="display:block;" />` : ""}
        <span style="font-size:16px;font-weight:700;color:#ffffff;">${company.name}</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        ${textToHtmlParagraphs(bodyText)}
        ${buildFooter(company.name)}
      </div>
    </div>
  `

  return { subject, html }
}
