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
import { revokePortalAccess } from "@/lib/actions/organisations"

export function RevokeAccessDialog({
  open,
  onOpenChange,
  profileId,
  userLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  userLabel: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const result = await revokePortalAccess(profileId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Portal access revoked for ${userLabel}.`)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke access for {userLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes their account and they will no longer be able to
            sign in to the client portal. This can&apos;t be undone — they would need a
            new invite to regain access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Revoke access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
