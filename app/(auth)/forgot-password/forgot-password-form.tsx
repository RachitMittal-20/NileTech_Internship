"use client"

import { useActionState } from "react"
import { Loader2, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset, type ForgotPasswordState } from "./actions"

const initialState: ForgotPasswordState = {}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <MailCheck className="size-8 text-accent" strokeWidth={1.75} />
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="mt-1 w-full cursor-pointer">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Send reset link
      </Button>
    </form>
  )
}
