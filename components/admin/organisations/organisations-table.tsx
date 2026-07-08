"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, ArrowUpDown, Building2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { OrganisationRowActions } from "@/components/admin/organisations/organisation-row-actions"
import {
  OrganisationFormSheet,
  useOrganisationFormSheet,
} from "@/components/admin/organisations/organisation-form-sheet"
import { getOrganisationById } from "@/lib/actions/organisations"
import type { OrganisationListRow, OrganisationListSort } from "@/lib/data/organisations"

const COLUMNS: { key: OrganisationListSort; label: string; className?: string }[] = [
  { key: "name", label: "Name" },
  { key: "contact_name", label: "Contact" },
  { key: "employee_count", label: "Employees", className: "text-right" },
  { key: "active_cycles", label: "Active cycles", className: "text-right" },
  { key: "status", label: "Status" },
]

export function OrganisationsTable({
  rows,
  sort,
  dir,
}: {
  rows: OrganisationListRow[]
  sort: OrganisationListSort
  dir: "asc" | "desc"
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sheet = useOrganisationFormSheet()

  function sortHref(column: OrganisationListSort) {
    const params = new URLSearchParams(searchParams.toString())
    const nextDir = sort === column && dir === "asc" ? "desc" : "asc"
    params.set("sort", column)
    params.set("dir", nextDir)
    params.set("page", "1")
    return `?${params.toString()}`
  }

  async function handleEdit(row: OrganisationListRow) {
    const full = await getOrganisationById(row.id)
    if (full) sheet.openEdit(full)
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Building2 strokeWidth={1.5} />}
        title="No organizations found"
        description="Try adjusting your search or filters, or create a new organization to get started."
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  <Link
                    href={sortHref(column.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {column.label}
                    {sort === column.key ? (
                      dir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                    )}
                  </Link>
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">
                  <Link href={`/admin/organisations/${row.id}`} className="hover:underline">
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.contact_name || row.contact_email || "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.employee_count}</TableCell>
                <TableCell className="text-right tabular-nums">{row.active_cycles}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "active" ? "secondary" : "outline"}>
                    {row.status === "active" ? "Active" : "Archived"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <OrganisationRowActions organisation={row} onEdit={() => handleEdit(row)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrganisationFormSheet
        open={sheet.open}
        onOpenChange={sheet.setOpen}
        organisation={sheet.organisation}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
