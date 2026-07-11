"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { checkRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

export interface LoginState {
  error?: string
}

const GENERIC_ERROR = "Incorrect email or password."

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim().toLowerCase()
  const password = formData.get("password")?.toString()
  const next = formData.get("next")?.toString()

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // Two keys: cap attempts per account (credential stuffing on one user) and
  // per source IP (spraying many accounts from one origin).
  const byEmail = checkRateLimit(`login:email:${email}`, { limit: 5, windowMs: 60_000 })
  const byIp = checkRateLimit(`login:ip:${ip}`, { limit: 20, windowMs: 60_000 })

  if (!byEmail.success || !byIp.success) {
    return { error: "Too many attempts. Wait a minute and try again." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: GENERIC_ERROR }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single()

  if (!profile) {
    // Auth user exists but has no profile row — treat as invalid rather than
    // leaking that the credentials were actually correct.
    await supabase.auth.signOut()
    return { error: GENERIC_ERROR }
  }

  if (!profile.is_active) {
    await logAudit({ id: data.user.id, role: profile.role }, "login_blocked_deactivated", "profiles", data.user.id, {
      email,
      ip,
    })
    await supabase.auth.signOut()
    return { error: "This account has been deactivated. Contact your administrator." }
  }

  // Supabase's own auth.audit_log_entries isn't populated in this project
  // (verified empty), so this is the only record of who signed in and when.
  await logAudit({ id: data.user.id, role: profile.role }, "login", "profiles", data.user.id, { email, ip })

  const dashboard = profile.role === "admin" ? "/admin/dashboard" : "/portal/dashboard"
  redirect(next && next.startsWith("/") ? next : dashboard)
}
