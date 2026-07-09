import "server-only"

import { format } from "date-fns"

// Hardcoded for now — becomes configurable from Settings in a later prompt.
const EMAIL_FOOTER = `
  <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
    Strong Path Diagnostics · This is an automated message, please do not reply directly to this email.
    If you have questions about these results, please contact your account administrator.
  </p>
`

export function buildBroadcastEmailHtml({
  orgName,
  cycleDate,
  recipientName,
  isAggregate,
}: {
  orgName: string
  cycleDate: string
  recipientName: string
  isAggregate: boolean
}): string {
  const formattedDate = format(new Date(cycleDate), "MMMM d, yyyy")
  const body = isAggregate
    ? `Attached is the aggregate results report for the test cycle conducted on <strong>${formattedDate}</strong>. This report covers every employee tested during this cycle.`
    : `Attached is your individual test results report from the test cycle conducted on <strong>${formattedDate}</strong> for ${orgName}.`

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <div style="background:#0b2545;border-radius:8px 8px 0 0;padding:20px 24px;">
        <span style="font-size:16px;font-weight:700;color:#ffffff;">Strong Path Diagnostics</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        <p style="margin:0 0 12px;font-size:14px;color:#0f1f38;">Hi ${recipientName},</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0f1f38;">${body}</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#0f1f38;">
          The full report is attached to this email as a PDF.
        </p>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `
}
