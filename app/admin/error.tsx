"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

// Renders inside app/admin/layout.tsx's shell (sidebar + header stay usable)
// when a page under /admin throws.
export default function AdminError({
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-foreground">This page couldn&apos;t load</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong loading this section. Try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={reset} className="cursor-pointer">
          Try again
        </Button>
        <Button asChild>
          <a href="/admin/dashboard">Go to dashboard</a>
        </Button>
      </div>
    </div>
  )
}
