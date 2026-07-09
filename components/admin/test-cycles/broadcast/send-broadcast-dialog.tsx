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
import { sendBroadcast } from "@/lib/actions/broadcast"

export function SendBroadcastDialog({
  open,
  onOpenChange,
  cycleId,
  sendAggregate,
  employeeIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycleId: string
  sendAggregate: boolean
  employeeIds: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const total = (sendAggregate ? 1 : 0) + employeeIds.length

  function onConfirm() {
    startTransition(async () => {
      const result = await sendBroadcast(cycleId, { sendAggregate, employeeIds })

      if (result.error) {
        toast.error(result.error)
        if (result.failedCount > 0 || result.sentCount > 0) {
          onOpenChange(false)
          router.refresh()
        }
        return
      }

      toast.success(
        `Sent ${result.sentCount} of ${result.sentCount + result.failedCount} report(s).` +
          (result.failedCount > 0 ? ` ${result.failedCount} failed — see the delivery log.` : "")
      )
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send {total} report{total === 1 ? "" : "s"}?</AlertDialogTitle>
          <AlertDialogDescription>
            {sendAggregate ? "The aggregate report and " : ""}
            {employeeIds.length} individual report{employeeIds.length === 1 ? "" : "s"} will be
            emailed as PDF attachments. This also moves the cycle to Broadcast status.
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
            disabled={isPending || total === 0}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Send
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
