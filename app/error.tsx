"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. Try again, or come back in a moment.
        </p>
      </div>
      <Button onClick={reset} className="cursor-pointer">
        Try again
      </Button>
    </div>
  )
}
