"use client"

import { Building2, TriangleAlert, Users } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BroadcastEmployee } from "@/lib/data/broadcast"

export function RecipientSelector({
  orgName,
  orgContactName,
  orgContactEmail,
  employees,
  sendAggregate,
  onToggleAggregate,
  selectedEmployeeIds,
  onToggleEmployee,
  onSetSelectedEmployeeIds,
}: {
  orgName: string
  orgContactName: string | null
  orgContactEmail: string | null
  employees: BroadcastEmployee[]
  sendAggregate: boolean
  onToggleAggregate: (checked: boolean) => void
  selectedEmployeeIds: Set<string>
  onToggleEmployee: (employeeId: string, checked: boolean) => void
  onSetSelectedEmployeeIds: (ids: Set<string>) => void
}) {
  const flaggedIds = employees.filter((e) => e.flagged).map((e) => e.employee_id)
  const allSelected = employees.length > 0 && employees.every((e) => selectedEmployeeIds.has(e.employee_id))

  function selectAll() {
    onSetSelectedEmployeeIds(new Set(employees.map((e) => e.employee_id)))
  }

  function selectNone() {
    onSetSelectedEmployeeIds(new Set())
  }

  function holdBackFlagged() {
    onSetSelectedEmployeeIds(
      new Set(employees.filter((e) => !e.flagged).map((e) => e.employee_id))
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Aggregate report</h3>
        <label className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 cursor-pointer">
          <Checkbox
            checked={sendAggregate}
            onCheckedChange={(checked) => onToggleAggregate(checked === true)}
            disabled={!orgContactEmail}
          />
          <span className="flex flex-1 items-center gap-2 text-sm">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="flex flex-col">
              <span className="font-medium text-foreground">{orgName} — HR Contact</span>
              <span className="text-xs text-muted-foreground">
                {orgContactEmail
                  ? `${orgContactName ?? "Contact"} · ${orgContactEmail}`
                  : "No contact email on file — add one on the organization profile."}
              </span>
            </span>
          </span>
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Individual reports</h3>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={holdBackFlagged}
              disabled={flaggedIds.length === 0}
            >
              <TriangleAlert className="size-3.5" />
              Hold back flagged
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={allSelected ? selectNone : selectAll}
            >
              {allSelected ? "Select none" : "Select all"}
            </Button>
          </div>
        </div>

        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employees on this cycle.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {employees.map((emp) => (
              <li key={emp.employee_id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
                  <Checkbox
                    checked={selectedEmployeeIds.has(emp.employee_id)}
                    onCheckedChange={(checked) => onToggleEmployee(emp.employee_id, checked === true)}
                    disabled={!emp.email}
                  />
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">{emp.full_name}</span>
                  {emp.flagged ? (
                    <Badge variant="destructive" className="gap-1">
                      <TriangleAlert className="size-3" />
                      Flagged
                    </Badge>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {emp.email ?? "No email on file"}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
