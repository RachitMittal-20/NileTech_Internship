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
import { archiveOrganisation, restoreOrganisation } from "@/lib/actions/organisations"

export function ArchiveOrganisationDialog({
  open,
  onOpenChange,
  organisationId,
  organisationName,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisationId: string
  organisationName: string
  mode: "archive" | "restore"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isArchive = mode === "archive"

  function onConfirm() {
    startTransition(async () => {
      const result = isArchive
        ? await archiveOrganisation(organisationId)
        : await restoreOrganisation(organisationId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isArchive ? "Organization archived." : "Organization restored.")
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchive ? "Archive" : "Restore"} {organisationName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchive
              ? "Archived organizations are hidden from the default list, but all data — employees, test cycles, and results — is retained and can be restored at any time."
              : "This organization will reappear in the default organizations list."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={isArchive ? "destructive" : "default"}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isArchive ? "Archive" : "Restore"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
