"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { createCycleRequest } from "@/lib/actions/portal-requests"
import { cycleRequestFormSchema } from "@/lib/validations/cycle-request"

type ScopeType = "all" | "count" | "subset"

function Section({
  show,
  children,
}: {
  show: boolean
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function RequestTestingForm({
  testTypes,
  employees,
}: {
  testTypes: { id: string; name: string }[]
  employees: { id: string; full_name: string; employee_code: string | null }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dates, setDates] = useState<Date[]>([])
  const [testTypeIds, setTestTypeIds] = useState<string[]>([])
  const [scopeType, setScopeType] = useState<ScopeType>("all")
  const [count, setCount] = useState("")
  const [employeeIds, setEmployeeIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const showTestTypes = dates.length > 0
  const showScope = showTestTypes && testTypeIds.length > 0
  const showSubmit =
    showScope &&
    (scopeType === "all" ||
      (scopeType === "count" && count.trim() !== "") ||
      (scopeType === "subset" && employeeIds.length > 0))

  const employeeScope = useMemo(() => {
    if (scopeType === "all") return { type: "all" as const }
    if (scopeType === "count") return { type: "count" as const, count: Number(count) || 0 }
    return { type: "subset" as const, employeeIds }
  }, [scopeType, count, employeeIds])

  function toggleTestType(id: string) {
    setTestTypeIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function toggleEmployee(id: string) {
    setEmployeeIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const values = {
      requestedDates: dates.map((d) => format(d, "yyyy-MM-dd")),
      testTypeIds,
      employeeScope,
      notes,
    }

    const parsed = cycleRequestFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form for errors.")
      return
    }

    startTransition(async () => {
      const result = await createCycleRequest(parsed.data)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success("Request submitted.")
      setDates([])
      setTestTypeIds([])
      setScopeType("all")
      setCount("")
      setEmployeeIds([])
      setNotes("")
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label>Preferred dates</Label>
        <p className="text-xs text-muted-foreground">Pick one or more dates that would work for your team.</p>
        <div className="w-fit rounded-2xl border border-border bg-card p-2">
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={(d) => setDates(d ?? [])}
            disabled={{ before: new Date() }}
          />
        </div>
        {dates.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Selected: {dates.map((d) => format(d, "MMM d")).join(", ")}
          </p>
        ) : null}
      </div>

      <Section show={showTestTypes}>
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <Label>Test types</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {testTypes.map((tt) => (
              <label
                key={tt.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5"
              >
                <Checkbox checked={testTypeIds.includes(tt.id)} onCheckedChange={() => toggleTestType(tt.id)} />
                {tt.name}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section show={showScope}>
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <Label>Who needs testing?</Label>
          <RadioGroup value={scopeType} onValueChange={(v) => setScopeType(v as ScopeType)} className="gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="all" />
              All current employees
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="count" />
              Approximately this many employees
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="subset" />
              Specific employees
            </label>
          </RadioGroup>

          <Section show={scopeType === "count"}>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 25"
              className="max-w-40"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </Section>

          <Section show={scopeType === "subset"}>
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
              {employees.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">No employees on file yet.</p>
              ) : (
                employees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox checked={employeeIds.includes(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} />
                    {emp.full_name}
                    {emp.employee_code ? (
                      <span className="text-xs text-muted-foreground">({emp.employee_code})</span>
                    ) : null}
                  </label>
                ))
              )}
            </div>
          </Section>
        </div>
      </Section>

      <Section show={showSubmit}>
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="request-notes">Notes (optional)</Label>
            <Textarea
              id="request-notes"
              rows={3}
              placeholder="Anything we should know — special scheduling needs, on-site contact, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-fit cursor-pointer" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit request
          </Button>
        </div>
      </Section>
    </form>
  )
}
