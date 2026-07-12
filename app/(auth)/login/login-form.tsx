"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "./actions"

const initialState: LoginState = {}

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  const error = state.error ?? initialError

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col">
        <Label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          className="h-11 w-full rounded-xl border-slate-200 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex flex-col">
        <Label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-xl border-slate-200 px-4 pr-10 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full cursor-pointer rounded-xl bg-[#0B1D3A] text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-700"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  )
}
