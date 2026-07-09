"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WizardStepper, type WizardStep } from "@/components/admin/test-cycles/wizard-stepper"
import { StepOrganisation } from "@/components/admin/test-cycles/steps/step-organisation"
import { StepTestTypes } from "@/components/admin/test-cycles/steps/step-test-types"
import { StepEmployees } from "@/components/admin/test-cycles/steps/step-employees"
import { StepSchedule } from "@/components/admin/test-cycles/steps/step-schedule"
import { StepReview } from "@/components/admin/test-cycles/steps/step-review"
import { createTestCycle, updateTestCycle } from "@/lib/actions/test-cycles"
import type { TestCycleFormValues } from "@/lib/validations/test-cycle"

const CREATE_STEPS: WizardStep[] = [
  { label: "Organization", description: "Client" },
  { label: "Test Types", description: "What to test" },
  { label: "Employees", description: "Who's tested" },
  { label: "Schedule", description: "When & where" },
  { label: "Review", description: "Confirm" },
]

const EDIT_STEPS: WizardStep[] = [
  { label: "Test Types", description: "What to test" },
  { label: "Employees", description: "Who's tested" },
  { label: "Schedule", description: "When & where" },
  { label: "Review", description: "Confirm" },
]

export interface CycleWizardProps {
  organisations: { id: string; name: string }[]
  testTypes: { id: string; name: string }[]
  cycleId?: string
  initial?: {
    orgId: string
    orgName: string
    testTypeIds: string[]
    employeeIds: string[]
    scheduledDate: string
    location: string
  }
}

export function CycleWizard({ organisations, testTypes, cycleId, initial }: CycleWizardProps) {
  const router = useRouter()
  const isEdit = Boolean(cycleId)
  const steps = isEdit ? EDIT_STEPS : CREATE_STEPS
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const [orgId, setOrgId] = useState(initial?.orgId ?? "")
  const [testTypeIds, setTestTypeIds] = useState<string[]>(initial?.testTypeIds ?? [])
  const [employeeIds, setEmployeeIds] = useState<string[]>(initial?.employeeIds ?? [])
  const [scheduledDate, setScheduledDate] = useState(initial?.scheduledDate ?? "")
  const [location, setLocation] = useState(initial?.location ?? "")

  // In edit mode there's no org step, so indices shift by one relative to CREATE_STEPS.
  const stepKind = isEdit
    ? (["test-types", "employees", "schedule", "review"] as const)[step]
    : (["organisation", "test-types", "employees", "schedule", "review"] as const)[step]

  const orgName = isEdit ? initial!.orgName : organisations.find((o) => o.id === orgId)?.name ?? ""

  const canProceed = useMemo(() => {
    switch (stepKind) {
      case "organisation":
        return Boolean(orgId)
      case "test-types":
        return testTypeIds.length > 0
      case "employees":
        return employeeIds.length > 0
      case "schedule":
        return Boolean(scheduledDate)
      default:
        return true
    }
  }, [stepKind, orgId, testTypeIds, employeeIds, scheduledDate])

  function goNext() {
    const next = Math.min(step + 1, steps.length - 1)
    setStep(next)
    setFurthestStep((f) => Math.max(f, next))
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  function onSubmit() {
    const values: TestCycleFormValues = {
      orgId,
      testTypeIds,
      employeeIds,
      scheduledDate,
      location,
    }

    startTransition(async () => {
      const result = cycleId ? await updateTestCycle(cycleId, values) : await createTestCycle(values)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? "Test cycle updated." : "Test cycle created.")
      router.push(`/admin/test-cycles/${result.id}`)
      router.refresh()
    })
  }

  const selectedTestTypeNames = testTypes.filter((t) => testTypeIds.includes(t.id)).map((t) => t.name)

  return (
    <div className="flex flex-col gap-8">
      <WizardStepper
        steps={steps}
        currentStep={step}
        furthestStep={furthestStep}
        onStepClick={setStep}
      />

      <Card>
        <CardContent className="min-h-96 py-2">
          {stepKind === "organisation" ? (
            <StepOrganisation organisations={organisations} value={orgId} onChange={setOrgId} />
          ) : null}
          {stepKind === "test-types" ? (
            <StepTestTypes testTypes={testTypes} value={testTypeIds} onChange={setTestTypeIds} />
          ) : null}
          {stepKind === "employees" ? (
            <StepEmployees orgId={orgId} value={employeeIds} onChange={setEmployeeIds} />
          ) : null}
          {stepKind === "schedule" ? (
            <StepSchedule
              date={scheduledDate}
              location={location}
              onDateChange={setScheduledDate}
              onLocationChange={setLocation}
            />
          ) : null}
          {stepKind === "review" ? (
            <StepReview
              orgName={orgName}
              testTypeNames={selectedTestTypeNames}
              employeeCount={employeeIds.length}
              date={scheduledDate}
              location={location}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={goBack}
          disabled={step === 0 || isPending}
        >
          <ArrowLeft />
          Back
        </Button>

        {step === steps.length - 1 ? (
          <Button type="button" className="cursor-pointer" onClick={onSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create Test Cycle"}
          </Button>
        ) : (
          <Button type="button" className="cursor-pointer" onClick={goNext} disabled={!canProceed}>
            Next
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  )
}
