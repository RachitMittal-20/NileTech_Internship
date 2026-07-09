"use client"

import { useEffect, useState } from "react"
import { Loader2, Search, Users } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/shared/empty-state"
import { listEmployeesForOrg } from "@/lib/actions/test-cycles"

export function StepEmployees({
  orgId,
  value,
  onChange,
  disabled,
}: {
  orgId: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const [employees, setEmployees] = useState<{ id: string; full_name: string; employee_code: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listEmployeesForOrg(orgId).then((data) => {
      if (!cancelled) {
        setEmployees(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [orgId])

  const filtered = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const filteredIds = filtered.map((e) => e.id)
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => value.includes(id))

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      onChange(value.filter((id) => !filteredIds.includes(id)))
    } else {
      onChange(Array.from(new Set([...value, ...filteredIds])))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Choose employees</h2>
        <p className="text-sm text-muted-foreground">
          Select who will be tested in this cycle.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={<Users strokeWidth={1.5} />}
          title="No employees for this organization"
          description="Add employees to this organization before scheduling a test cycle."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter employees..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={disabled}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={toggleAllFiltered}
                disabled={disabled}
              />
              Select all{query ? " filtered" : ""}
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
            <ul className="divide-y divide-border">
              {filtered.map((emp) => {
                const checked = value.includes(emp.id)
                return (
                  <li key={emp.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(emp.id)}
                        disabled={disabled}
                      />
                      <span className="flex-1 text-foreground">{emp.full_name}</span>
                      {emp.employee_code ? (
                        <span className="text-xs text-muted-foreground">{emp.employee_code}</span>
                      ) : null}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            {value.length} of {employees.length} employee{employees.length === 1 ? "" : "s"} selected
          </p>
        </>
      )}
    </div>
  )
}
