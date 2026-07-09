"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { advanceTestCycleStatus } from "@/lib/actions/test-cycles"

export function MarkReviewCompleteDialog({
  open,
  onOpenChange,
  cycleId,
  missing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycleId: string
  missing: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const result = await advanceTestCycleStatus(cycleId, "review")

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Moved to Review.")
      router.push(`/admin/test-cycles/${cycleId}`)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark review complete?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">
              {missing.length === 0 ? (
                <span>Every sample has a recorded result. This moves the cycle to Review.</span>
              ) : (
                <>
                  <span>
                    {missing.length} result{missing.length === 1 ? " is" : "s are"} still
                    incomplete. You can still move this cycle to Review — missing results can be
                    filled in later.
                  </span>
                  <ul className="max-h-40 list-disc overflow-y-auto rounded-md border border-border bg-muted/30 px-6 py-2 text-xs">
                    {missing.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Mark Review Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
