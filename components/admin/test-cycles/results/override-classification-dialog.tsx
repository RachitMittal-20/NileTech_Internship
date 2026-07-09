"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { overrideResultClassification } from "@/lib/actions/results"

export function OverrideClassificationDialog({
  open,
  onOpenChange,
  cycleId,
  sampleId,
  currentClassification,
  onOverridden,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycleId: string
  sampleId: string
  currentClassification: "clear" | "flagged"
  onOverridden: (classification: "clear" | "flagged", reason: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [classification, setClassification] = useState<"clear" | "flagged">(currentClassification)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await overrideResultClassification(cycleId, sampleId, classification, reason)

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Classification overridden.")
      onOverridden(classification, reason.trim())
      setReason("")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override classification</DialogTitle>
          <DialogDescription>
            Manually set this result&apos;s classification. The reason is recorded in the audit
            log.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Classification</Label>
            <Select
              value={classification}
              onValueChange={(v) => setClassification(v as "clear" | "flagged")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="override-reason">Reason</Label>
            <Textarea
              id="override-reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this classification being overridden?"
              rows={3}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
