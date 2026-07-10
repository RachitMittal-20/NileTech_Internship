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
import { setAdminActive } from "@/lib/actions/team"

export function SetActiveDialog({
  open,
  onOpenChange,
  profileId,
  memberLabel,
  activate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  memberLabel: string
  activate: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const result = await setAdminActive(profileId, activate)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(activate ? `${memberLabel} reactivated.` : `${memberLabel} deactivated.`)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {activate ? "Reactivate" : "Deactivate"} {memberLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activate
              ? "They'll be able to sign in and access the admin system again."
              : "They'll be signed out immediately and won't be able to sign back in until reactivated."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={activate ? "default" : "destructive"}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {activate ? "Reactivate" : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
