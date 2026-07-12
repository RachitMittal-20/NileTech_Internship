import Link from "next/link"
import type { Metadata } from "next"

import { LoginLeftPanel } from "@/components/login/login-left-panel"
import { LoginRightPanel } from "./login-right-panel"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in — Strong Path Diagnostics",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const initialError =
    error === "deactivated"
      ? "This account has been deactivated. Contact your administrator."
      : undefined

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[55%]">
        <LoginLeftPanel />
      </div>
      <div className="flex w-full items-center justify-center bg-[#F8FAFC] p-8 lg:w-[45%]">
        <LoginRightPanel>
          <LoginForm next={next} initialError={initialError} />
          <p className="mt-4 text-center text-sm text-slate-500">
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="text-teal-600 underline-offset-2 hover:text-teal-700 hover:underline"
            >
              Reset it
            </Link>
          </p>
        </LoginRightPanel>
      </div>
    </div>
  )
}
