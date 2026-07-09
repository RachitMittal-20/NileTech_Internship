"use client"

import { useState } from "react"
import { AlertTriangle, Check, Loader2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { FlaskConical } from "lucide-react"
import { DynamicField } from "@/components/admin/test-cycles/results/dynamic-field"
import { ClassificationBadge } from "@/components/admin/test-cycles/results/classification-badge"
import { LabPdfUpload } from "@/components/admin/test-cycles/results/lab-pdf-upload"
import { OverrideClassificationDialog } from "@/components/admin/test-cycles/results/override-classification-dialog"
import type { ResultsSample, ResultsTestType, ResultsEmployee } from "@/lib/data/results"
import { getFieldValue, getOverride, type ClassificationResult, type ResultValues } from "@/lib/classification"
import type { SampleSaveStatus } from "@/components/admin/test-cycles/results/use-results-state"

export function ResultsGridView({
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
  const [testTypeId, setTestTypeId] = useState(testTypes[0]?.id ?? "")
  const [overrideTarget, setOverrideTarget] = useState<{ sampleId: string; classification: "clear" | "flagged" } | null>(null)

  const testType = testTypes.find((t) => t.id === testTypeId)

  if (!testType) {
    return (
      <EmptyState
        icon={<FlaskConical strokeWidth={1.5} />}
        title="No test types on this cycle"
        description="This cycle has no test types to record results for."
      />
    )
  }

  const sampleByEmployee = new Map(
    samples.filter((s) => s.test_type_id === testTypeId).map((s) => [s.employee_id, s])
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Test type</label>
        <Select value={testTypeId} onValueChange={setTestTypeId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {testTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-10 min-w-48 bg-muted/40 px-4 py-2.5 text-left font-medium text-foreground">
                Employee
              </th>
              {testType.fields.map((field) => (
                <th key={field.key} className="min-w-40 px-4 py-2.5 text-left font-medium text-foreground">
                  {field.label}
                  {field.unit ? <span className="text-muted-foreground"> ({field.unit})</span> : null}
                </th>
              ))}
              <th className="min-w-32 px-4 py-2.5 text-left font-medium text-foreground">Classification</th>
              <th className="min-w-40 px-4 py-2.5 text-left font-medium text-foreground">Lab report</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const sample = sampleByEmployee.get(emp.employee_id)
              const status = sample ? statusBySample[sample.sample_id] : undefined
              const classification = sample ? getClassification(sample.sample_id, testTypeId) : null
              const values = sample ? valuesBySample[sample.sample_id] ?? {} : {}

              return (
                <tr
                  key={emp.employee_id}
                  className={`border-b border-border last:border-0 ${emp.absent ? "opacity-60" : ""}`}
                >
                  <td className="sticky left-0 z-10 bg-background px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{emp.full_name}</span>
                      {emp.employee_code ? (
                        <span className="text-xs text-muted-foreground">{emp.employee_code}</span>
                      ) : null}
                    </div>
                  </td>

                  {!sample ? (
                    <td
                      colSpan={testType.fields.length + 2}
                      className="px-4 py-2 text-sm text-muted-foreground"
                    >
                      {emp.absent ? "Absent" : "No sample collected"}
                    </td>
                  ) : (
                    <>
                      {testType.fields.map((field) => (
                        <td key={field.key} className="px-2 py-1.5">
                          <DynamicField
                            field={field}
                            value={getFieldValue(values, field.key)}
                            onChange={(v) => updateField(sample.sample_id, field.key, v)}
                            compact
                          />
                        </td>
                      ))}
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-1.5">
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
                            <ClassificationBadge
                              result={classification}
                              overrideReason={getOverride(values)?.reason}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-1.5">
                        <LabPdfUpload
                          cycleId={cycleId}
                          sampleId={sample.sample_id}
                          path={sample.result?.lab_pdf_url ?? null}
                          onUploaded={(path) => onPdfUploaded(sample.sample_id, path)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
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
