"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Archive, ArchiveRestore, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArchiveOrganisationDialog } from "@/components/admin/organisations/archive-organisation-dialog"
import type { OrganisationListRow } from "@/lib/data/organisations"

export function OrganisationRowActions({
  organisation,
  onEdit,
}: {
  organisation: OrganisationListRow
  onEdit: () => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isArchived = organisation.status === "archived"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/admin/organisations/${organisation.id}`}>
              <ExternalLink />
              View profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            variant={isArchived ? "default" : "destructive"}
            className="cursor-pointer"
          >
            {isArchived ? <ArchiveRestore /> : <Archive />}
            {isArchived ? "Restore" : "Archive"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveOrganisationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        organisationId={organisation.id}
        organisationName={organisation.name}
        mode={isArchived ? "restore" : "archive"}
      />
    </>
  )
}
