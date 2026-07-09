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

export function SendToLabDialog({
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
      const result = await advanceTestCycleStatus(cycleId, "at_lab")

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Cycle sent to lab.")
      router.push(`/admin/test-cycles/${cycleId}`)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send to lab?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">
              {missing.length === 0 ? (
                <span>Every sample has been recorded. This moves the cycle to At Lab.</span>
              ) : (
                <>
                  <span>
                    {missing.length} sample{missing.length === 1 ? " is" : "s are"} still missing.
                    You can still send this cycle to the lab — missing samples can be recorded
                    later.
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
            Send to Lab
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
