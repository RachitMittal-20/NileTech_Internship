"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export interface ResetPasswordState {
  error?: string
}

export async function updatePassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = formData.get("password")?.toString()
  const confirmPassword = formData.get("confirmPassword")?.toString()

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Your reset link has expired. Request a new one." }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "Could not update your password. Try again." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  redirect(profile?.role === "admin" ? "/admin/dashboard" : "/portal/dashboard")
}
