import Link from "next/link"
import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in — Strong Path Diagnostics",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <AuthCard
      title="Sign in"
      description="Enter your email and password to access your account."
      footer={
        <span>
          Forgot your password?{" "}
          <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-4">
            Reset it
          </Link>
        </span>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  )
}
