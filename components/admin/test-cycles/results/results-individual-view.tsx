"use client"

import { useState } from "react"
import { AlertTriangle, Check, Loader2, Users } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/shared/empty-state"
import { DynamicField } from "@/components/admin/test-cycles/results/dynamic-field"
import { ClassificationBadge } from "@/components/admin/test-cycles/results/classification-badge"
import { LabPdfUpload } from "@/components/admin/test-cycles/results/lab-pdf-upload"
import { OverrideClassificationDialog } from "@/components/admin/test-cycles/results/override-classification-dialog"
import type { ResultsSample, ResultsTestType, ResultsEmployee } from "@/lib/data/results"
import { getFieldValue, getOverride, type ClassificationResult, type ResultValues } from "@/lib/classification"
import type { SampleSaveStatus } from "@/components/admin/test-cycles/results/use-results-state"

export function ResultsIndividualView({
  cycleId,
  testTypes,
  employees,
  samples,
  valuesBySample,
  statusBySample,
  updateField,
  applyOverride,
  getClassification,
  onPdfUploaded,
}: {
  cycleId: string
  testTypes: ResultsTestType[]
  employees: ResultsEmployee[]
  samples: ResultsSample[]
  valuesBySample: Record<string, ResultValues>
  statusBySample: Record<string, SampleSaveStatus>
  updateField: (sampleId: string, fieldKey: string, value: ResultValues[string]) => void
  applyOverride: (sampleId: string, classification: "clear" | "flagged", reason: string) => void
  getClassification: (sampleId: string, testTypeId: string) => ClassificationResult | null
  onPdfUploaded: (sampleId: string, path: string) => void
}) {
  const nonAbsent = employees.filter((e) => !e.absent)
  const [employeeId, setEmployeeId] = useState(nonAbsent[0]?.employee_id ?? "")
  const [overrideTarget, setOverrideTarget] = useState<{ sampleId: string; classification: "clear" | "flagged" } | null>(null)

  if (nonAbsent.length === 0) {
    return (
      <EmptyState
        icon={<Users strokeWidth={1.5} />}
        title="No employees to record results for"
        description="Every employee on this cycle is marked absent."
      />
    )
  }

  const employeeSamples = samples.filter((s) => s.employee_id === employeeId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Employee</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {nonAbsent.map((emp) => (
              <SelectItem key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        {testTypes.map((testType) => {
          const sample = employeeSamples.find((s) => s.test_type_id === testType.id)
          if (!sample) {
            return (
              <Card key={testType.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{testType.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No sample collected for this test.</p>
                </CardContent>
              </Card>
            )
          }

          const status = statusBySample[sample.sample_id]
          const classification = getClassification(sample.sample_id, testType.id)
          const values = valuesBySample[sample.sample_id] ?? {}

          return (
            <Card key={testType.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">{testType.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {status === "saving" ? (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  ) : status === "saved" ? (
                    <Check className="size-3.5 text-primary" />
                  ) : status === "error" ? (
                    <AlertTriangle className="size-3.5 text-destructive" />
                  ) : null}
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() =>
                      setOverrideTarget({
                        sampleId: sample.sample_id,
                        classification: classification?.flagged ? "flagged" : "clear",
                      })
                    }
                  >
                    <ClassificationBadge result={classification} overrideReason={getOverride(values)?.reason} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {testType.fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <DynamicField
                        field={field}
                        value={getFieldValue(values, field.key)}
                        onChange={(v) => updateField(sample.sample_id, field.key, v)}
                      />
                    </div>
                  ))}
                </div>
                <LabPdfUpload
                  cycleId={cycleId}
                  sampleId={sample.sample_id}
                  path={sample.result?.lab_pdf_url ?? null}
                  onUploaded={(path) => onPdfUploaded(sample.sample_id, path)}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {overrideTarget ? (
        <OverrideClassificationDialog
          open={Boolean(overrideTarget)}
          onOpenChange={(open) => !open && setOverrideTarget(null)}
          cycleId={cycleId}
          sampleId={overrideTarget.sampleId}
          currentClassification={overrideTarget.classification}
          onOverridden={(classification, reason) => {
            applyOverride(overrideTarget.sampleId, classification, reason)
            setOverrideTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}
