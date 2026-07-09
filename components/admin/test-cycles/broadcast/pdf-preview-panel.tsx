"use client"

import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BroadcastEmployee } from "@/lib/data/broadcast"

export function PdfPreviewPanel({
  cycleId,
  orgName,
  employees,
  hasOrgContact,
}: {
  cycleId: string
  orgName: string
  employees: BroadcastEmployee[]
  hasOrgContact: boolean
}) {
  const [selection, setSelection] = useState(hasOrgContact ? "aggregate" : (employees[0]?.employee_id ?? ""))

  const previewUrl =
    selection === "aggregate"
      ? `/admin/test-cycles/${cycleId}/broadcast/preview/aggregate`
      : selection
        ? `/admin/test-cycles/${cycleId}/broadcast/preview/individual/${selection}`
        : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Preview</h3>
        <Select value={selection} onValueChange={setSelection}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hasOrgContact ? (
              <SelectItem value="aggregate">{orgName} — Aggregate</SelectItem>
            ) : null}
            {employees.map((emp) => (
              <SelectItem key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {previewUrl ? (
        <iframe
          key={previewUrl}
          src={previewUrl}
          title="Report preview"
          className="h-[600px] w-full rounded-lg border border-border"
        />
      ) : (
        <div className="flex h-[600px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          Nothing to preview yet.
        </div>
      )}
    </div>
  )
}
