import "server-only"

import { Resend } from "resend"

export const RESEND_NOT_CONFIGURED_MESSAGE =
  "Resend is not configured. Set RESEND_API_KEY in your environment to send broadcasts."

// Resend's own shared sandbox sender — works with any Resend account with no
// domain verification needed, so this is a safe default for RESEND_FROM_EMAIL
// rather than requiring every environment to configure a verified sender
// before broadcasts/reminders can send at all.
const DEFAULT_RESEND_FROM_EMAIL = "onboarding@resend.dev"

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_RESEND_FROM_EMAIL
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
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

  if (!resend) {
    return { success: false, error: RESEND_NOT_CONFIGURED_MESSAGE }
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
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

  if (!resend) {
    return { success: false, error: RESEND_NOT_CONFIGURED_MESSAGE }
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
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
