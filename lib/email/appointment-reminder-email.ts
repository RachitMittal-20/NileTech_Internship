import "server-only"

import { format } from "date-fns"

import { getCompanyProfile } from "@/lib/data/company-profile"

export async function buildAppointmentReminderEmail({
  orgName,
  scheduledDate,
  location,
}: {
  orgName: string
  scheduledDate: string
  location: string | null
}): Promise<{ subject: string; html: string }> {
  const company = await getCompanyProfile()
  const dateLabel = format(new Date(scheduledDate), "EEEE, MMMM d, yyyy")

  const subject = `Reminder: testing scheduled for ${dateLabel}`

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <div style="background:#0b2545;border-radius:8px 8px 0 0;padding:20px 24px;${company.logoUrl ? "display:flex;align-items:center;gap:10px;" : ""}">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${company.name}" height="28" style="display:block;" />` : ""}
        <span style="font-size:16px;font-weight:700;color:#ffffff;">${company.name}</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0f1f38;">Hi ${orgName} team,</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0f1f38;">
          This is a reminder that testing is scheduled for <strong>${dateLabel}</strong>${location ? ` at <strong>${location}</strong>` : ""}.
        </p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0f1f38;">
          Please make sure your employees are prepared. If anything has changed, contact your account administrator.
        </p>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
          ${company.name} · This is an automated reminder, please do not reply directly to this email.
        </p>
      </div>
    </div>
  `

  return { subject, html }
}
