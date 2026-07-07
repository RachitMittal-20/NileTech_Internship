import Link from "next/link"
import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { createClient } from "@/lib/supabase/server"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "Set a new password — Strong Path Diagnostics",
}

async function hasValidSession(code?: string) {
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return false
    return true
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return Boolean(user)
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const valid = await hasValidSession(code)

  if (!valid) {
    return (
      <AuthCard title="Link expired" description="This password reset link is invalid or has expired.">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Request a new link from the sign-in page.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set a new password" description="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthCard>
  )
}
