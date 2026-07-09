"use client"

import { useState } from "react"
import { Mail, MapPin, Phone, Pencil, Archive, ArchiveRestore } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SetBreadcrumbLabel } from "@/components/admin/breadcrumb-label-context"
import { OrganisationFormSheet } from "@/components/admin/organisations/organisation-form-sheet"
import { ArchiveOrganisationDialog } from "@/components/admin/organisations/archive-organisation-dialog"
import type { Tables } from "@/types/database"

export function OrganisationHeader({ organisation }: { organisation: Tables<"organisations"> }) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isArchived = organisation.status === "archived"

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <SetBreadcrumbLabel segment={organisation.id} label={organisation.name} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {organisation.name}
            </h1>
            <Badge variant={isArchived ? "outline" : "secondary"}>
              {isArchived ? "Archived" : "Active"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {organisation.contact_email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {organisation.contact_email}
              </span>
            ) : null}
            {organisation.contact_phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {organisation.contact_phone}
              </span>
            ) : null}
            {organisation.address ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {organisation.address}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
          <Button
            variant={isArchived ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setConfirmOpen(true)}
          >
            {isArchived ? <ArchiveRestore /> : <Archive />}
            {isArchived ? "Restore" : "Archive"}
          </Button>
        </div>
      </div>

      <OrganisationFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        organisation={organisation}
      />
      <ArchiveOrganisationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        organisationId={organisation.id}
        organisationName={organisation.name}
        mode={isArchived ? "restore" : "archive"}
      />
    </div>
  )
}
