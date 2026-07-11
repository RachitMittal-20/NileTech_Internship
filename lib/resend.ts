import "server-only"

import { Resend } from "resend"

export const RESEND_NOT_CONFIGURED_MESSAGE =
  "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment to send broadcasts."

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

let client: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  attachment: {
    filename: string
    content: Buffer
  }
}

export interface SendEmailResult {
  success: boolean
  error?: string
}

export interface SendPlainEmailInput {
  to: string
  subject: string
  html: string
}

// Same never-throws contract as sendBroadcastEmail, but without a mandatory
// attachment — used for notification-style sends (e.g. appointment
// reminders) that don't carry a PDF.
export async function sendPlainEmail(input: SendPlainEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!resend || !fromEmail) {
    return { success: false, error: RESEND_NOT_CONFIGURED_MESSAGE }
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not send the email." }
  }
}

// Never throws — a misconfigured or failed send is a normal, expected
// outcome here (recorded per-recipient in the broadcasts table with a
// resend button), not a server error.
export async function sendBroadcastEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!resend || !fromEmail) {
    return { success: false, error: RESEND_NOT_CONFIGURED_MESSAGE }
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: [
        {
          filename: input.attachment.filename,
          content: input.attachment.content,
        },
      ],
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not send the email." }
  }
}
