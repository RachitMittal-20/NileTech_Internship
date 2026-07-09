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
import { STATUS_LABEL, type TestCycleStatus } from "@/lib/test-cycle-status"

export function AdvanceStatusDialog({
  open,
  onOpenChange,
  cycleId,
  from,
  to,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycleId: string
  from: TestCycleStatus
  to: TestCycleStatus
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const result = await advanceTestCycleStatus(cycleId, to)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Moved to ${STATUS_LABEL[to]}.`)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Move from {STATUS_LABEL[from]} to {STATUS_LABEL[to]}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This updates the cycle&apos;s status for everyone viewing it. Stages can&apos;t be
            skipped or reversed.
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
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
