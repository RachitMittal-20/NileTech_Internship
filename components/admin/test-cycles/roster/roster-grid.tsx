"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { AlertTriangle, Check, Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RosterProgress } from "@/components/admin/test-cycles/roster/roster-progress"
import { SendToLabDialog } from "@/components/admin/test-cycles/roster/send-to-lab-dialog"
import { saveSampleCell, setEmployeeAbsent } from "@/lib/actions/roster"
import type { RosterData } from "@/lib/data/roster"
import { cn } from "@/lib/utils"

type CellStatus = "idle" | "saving" | "saved" | "error"

interface CellState {
  value: string
  status: CellStatus
}

function cellKey(employeeId: string, testTypeId: string) {
  return `${employeeId}:${testTypeId}`
}

const SAVE_DEBOUNCE_MS = 500

export function RosterGrid({ cycleId, data }: { cycleId: string; data: RosterData }) {
  const { testTypes, employees: initialEmployees } = data

  const [absentByEmployee, setAbsentByEmployee] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialEmployees.map((e) => [e.employee_id, e.status === "absent"]))
  )
  const [pendingAbsent, setPendingAbsent] = useState<Record<string, boolean>>({})

  const [cells, setCells] = useState<Record<string, CellState>>(() => {
    const initial: Record<string, CellState> = {}
    for (const emp of initialEmployees) {
      for (const type of testTypes) {
        const key = cellKey(emp.employee_id, type.id)
        const sample = data.samples.find(
          (s) => s.employee_id === emp.employee_id && s.test_type_id === type.id
        )
        initial[key] = { value: sample?.vial_reference ?? "", status: "idle" }
      }
    }
    return initial
  })

  const [sendToLabOpen, setSendToLabOpen] = useState(false)

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const nonAbsentEmployees = useMemo(
    () => initialEmployees.filter((e) => !absentByEmployee[e.employee_id]),
    [initialEmployees, absentByEmployee]
  )

  const duplicateKeys = useMemo(() => {
    const byValue = new Map<string, string[]>()
    for (const [key, cell] of Object.entries(cells)) {
      if (!cell.value.trim()) continue
      const list = byValue.get(cell.value.trim()) ?? []
      list.push(key)
      byValue.set(cell.value.trim(), list)
    }
    const dupes = new Set<string>()
    for (const keys of byValue.values()) {
      if (keys.length > 1) keys.forEach((k) => dupes.add(k))
    }
    return dupes
  }, [cells])

  const filledCount = useMemo(
    () =>
      nonAbsentEmployees.reduce((count, emp) => {
        return (
          count +
          testTypes.filter((type) => cells[cellKey(emp.employee_id, type.id)]?.value.trim()).length
        )
      }, 0),
    [nonAbsentEmployees, testTypes, cells]
  )
  const totalRequired = nonAbsentEmployees.length * testTypes.length

  const missingLabels = useMemo(() => {
    const labels: string[] = []
    for (const emp of nonAbsentEmployees) {
      for (const type of testTypes) {
        if (!cells[cellKey(emp.employee_id, type.id)]?.value.trim()) {
          labels.push(`${emp.full_name} — ${type.name}`)
        }
      }
    }
    return labels
  }, [nonAbsentEmployees, testTypes, cells])

  const scheduleSave = useCallback(
    (employeeId: string, testTypeId: string, value: string) => {
      const key = cellKey(employeeId, testTypeId)
      if (timers.current[key]) clearTimeout(timers.current[key])

      timers.current[key] = setTimeout(async () => {
        setCells((prev) => ({ ...prev, [key]: { ...prev[key], status: "saving" } }))
        const result = await saveSampleCell(cycleId, employeeId, testTypeId, value)
        setCells((prev) => ({
          ...prev,
          [key]: { ...prev[key], status: result.error ? "error" : "saved" },
        }))
        if (result.error) toast.error(result.error)
      }, SAVE_DEBOUNCE_MS)
    },
    [cycleId]
  )

  function onCellChange(employeeId: string, testTypeId: string, value: string) {
    const key = cellKey(employeeId, testTypeId)
    setCells((prev) => ({ ...prev, [key]: { value, status: prev[key]?.status ?? "idle" } }))
    scheduleSave(employeeId, testTypeId, value)
  }

  function focusCell(employeeId: string, testTypeId: string) {
    const key = cellKey(employeeId, testTypeId)
    inputRefs.current[key]?.focus()
    inputRefs.current[key]?.select()
  }

  // Enter (common after a barcode scan) advances to the same test type for
  // the next non-absent employee. Tab is left to native browser behavior —
  // disabled inputs on absent rows are skipped automatically.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, employeeId: string, testTypeId: string) {
    if (e.key !== "Enter") return
    e.preventDefault()

    const rowIndex = nonAbsentEmployees.findIndex((emp) => emp.employee_id === employeeId)
    const nextEmployee = nonAbsentEmployees[rowIndex + 1]
    if (nextEmployee) {
      focusCell(nextEmployee.employee_id, testTypeId)
    }
  }

  async function toggleAbsent(employeeId: string, absent: boolean) {
    setPendingAbsent((prev) => ({ ...prev, [employeeId]: true }))
    const result = await setEmployeeAbsent(cycleId, employeeId, absent)
    setPendingAbsent((prev) => ({ ...prev, [employeeId]: false }))

    if (result.error) {
      toast.error(result.error)
      return
    }

    setAbsentByEmployee((prev) => ({ ...prev, [employeeId]: absent }))
    toast.success(absent ? "Marked absent." : "Marked present.")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md flex-1">
          <RosterProgress filled={filledCount} total={totalRequired} />
        </div>
        <Button className="cursor-pointer" onClick={() => setSendToLabOpen(true)}>
          <Send />
          Send to Lab
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-10 min-w-56 bg-muted/40 px-4 py-2.5 text-left font-medium text-foreground">
                Employee
              </th>
              {testTypes.map((type) => (
                <th key={type.id} className="min-w-40 px-4 py-2.5 text-left font-medium text-foreground">
                  {type.name}
                </th>
              ))}
              <th className="min-w-28 px-4 py-2.5 text-left font-medium text-foreground">Absent</th>
            </tr>
          </thead>
          <tbody>
            {initialEmployees.map((emp) => {
              const absent = absentByEmployee[emp.employee_id]
              return (
                <tr
                  key={emp.employee_id}
                  className={cn("border-b border-border last:border-0", absent && "bg-muted/40 opacity-60")}
                >
                  <td className="sticky left-0 z-10 bg-background px-4 py-2 [tr:nth-child(even)_&]:bg-background">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{emp.full_name}</span>
                      {emp.employee_code ? (
                        <span className="text-xs text-muted-foreground">{emp.employee_code}</span>
                      ) : null}
                    </div>
                  </td>
                  {testTypes.map((type) => {
                    const key = cellKey(emp.employee_id, type.id)
                    const cell = cells[key]
                    const isDuplicate = duplicateKeys.has(key) && !absent
                    return (
                      <td key={type.id} className="px-2 py-1.5">
                        <div className="relative">
                          <input
                            ref={(el) => {
                              inputRefs.current[key] = el
                            }}
                            value={cell?.value ?? ""}
                            disabled={absent}
                            onChange={(e) => onCellChange(emp.employee_id, type.id, e.target.value)}
                            onKeyDown={(e) => onKeyDown(e, emp.employee_id, type.id)}
                            placeholder="Vial ref."
                            className={cn(
                              "h-9 w-full rounded-md border bg-background px-2.5 pr-7 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-transparent",
                              isDuplicate ? "border-amber-500" : "border-border"
                            )}
                          />
                          {!absent ? (
                            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                              {cell?.status === "saving" ? (
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                              ) : cell?.status === "saved" ? (
                                <Check className="size-3.5 text-primary" />
                              ) : cell?.status === "error" ? (
                                <AlertTriangle className="size-3.5 text-destructive" />
                              ) : isDuplicate ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="pointer-events-auto size-3.5 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Duplicate vial reference used elsewhere in this cycle
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-2">
                    <Switch
                      checked={absent}
                      disabled={pendingAbsent[emp.employee_id]}
                      onCheckedChange={(checked) => toggleAbsent(emp.employee_id, checked)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <SendToLabDialog
        open={sendToLabOpen}
        onOpenChange={setSendToLabOpen}
        cycleId={cycleId}
        missing={missingLabels}
      />
    </div>
  )
}
