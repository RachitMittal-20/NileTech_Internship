"use client"

import { useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function BulkPdfDownloadButton({ cycleId }: { cycleId: string }) {
  const [progress, setProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function onClick() {
    setIsDownloading(true)
    setProgress(8)

    // The zip is generated server-side in one response — there's no real
    // byte-level progress to report while that's in flight, so this
    // simulates a smooth fill capped at 90% until the response actually
    // resolves, then snaps to 100%. Honest about being an estimate, not a
    // fake exact number.
    timerRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15))
    }, 200)

    try {
      const res = await fetch(`/portal/results/export/pdf?cycleId=${cycleId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Could not generate the download.")
      }

      const blob = await res.blob()
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(100)

      const failedCount = Number(res.headers.get("X-Failed-Reports") ?? "0")
      if (failedCount > 0) {
        toast.warning(
          `${failedCount} report${failedCount === 1 ? "" : "s"} could not be generated and ${failedCount === 1 ? "was" : "were"} left out of the download.`
        )
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "results.zip"
      const disposition = res.headers.get("Content-Disposition")
      const match = disposition?.match(/filename="(.+)"/)
      if (match?.[1]) a.download = match[1]
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setTimeout(() => {
        setIsDownloading(false)
        setProgress(0)
      }, 500)
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current)
      setIsDownloading(false)
      setProgress(0)
      toast.error(err instanceof Error ? err.message : "Could not generate the download.")
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" className="cursor-pointer" onClick={onClick} disabled={isDownloading}>
        {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Download all as PDF
      </Button>
      {isDownloading ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
          />
        </div>
      ) : null}
    </div>
  )
}
