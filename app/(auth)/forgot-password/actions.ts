"use server"

import { headers } from "next/headers"

import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

export interface ForgotPasswordState {
  error?: string
  success?: boolean
}

const GENERIC_SUCCESS: ForgotPasswordState = { success: true }

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email")?.toString().trim().toLowerCase()

  if (!email) {
    return { error: "Enter your email address." }
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  const byEmail = checkRateLimit(`reset:email:${email}`, { limit: 3, windowMs: 15 * 60_000 })
  const byIp = checkRateLimit(`reset:ip:${ip}`, { limit: 10, windowMs: 15 * 60_000 })

  // Rate-limited requests still report generic success — a different response
  // here would let an attacker use the limiter itself as an enumeration oracle.
  if (!byEmail.success || !byIp.success) {
    return GENERIC_SUCCESS
  }

  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  // Always return success regardless of whether the email exists or the send
  // actually succeeded — never reveal account existence via this form.
  return GENERIC_SUCCESS
}
