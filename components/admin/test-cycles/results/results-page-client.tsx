"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RosterProgress } from "@/components/admin/test-cycles/roster/roster-progress"
import { ResultsGridView } from "@/components/admin/test-cycles/results/results-grid-view"
import { ResultsIndividualView } from "@/components/admin/test-cycles/results/results-individual-view"
import { MarkReviewCompleteDialog } from "@/components/admin/test-cycles/results/mark-review-complete-dialog"
import { useResultsState } from "@/components/admin/test-cycles/results/use-results-state"
import { isComplete } from "@/lib/classification"
import type { ResultsPageData } from "@/lib/data/results"

export function ResultsPageClient({ cycleId, data }: { cycleId: string; data: ResultsPageData }) {
  const { testTypes, employees, samples } = data
  const [viewMode, setViewMode] = useState<"grid" | "individual">("grid")
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const { valuesBySample, statusBySample, updateField, applyOverride, getClassification } =
    useResultsState(cycleId, samples, testTypes)

  const [pdfPaths, setPdfPaths] = useState<Record<string, string>>({})

  function onPdfUploaded(sampleId: string, path: string) {
    setPdfPaths((prev) => ({ ...prev, [sampleId]: path }))
  }

  const samplesWithPdf = useMemo(
    () =>
      samples.map((s): ResultsPageData["samples"][number] => {
        const overridePath = pdfPaths[s.sample_id]
        if (!overridePath) return s
        return {
          ...s,
          result: {
            values: s.result?.values ?? {},
            classification: s.result?.classification ?? null,
            reviewed: s.result?.reviewed ?? false,
            lab_pdf_url: overridePath,
          },
        }
      }),
    [samples, pdfPaths]
  )

  const testTypeById = useMemo(() => new Map(testTypes.map((t) => [t.id, t])), [testTypes])
  const employeeById = useMemo(() => new Map(employees.map((e) => [e.employee_id, e])), [employees])

  const requiredSamples = useMemo(
    () => samplesWithPdf.filter((s) => !employeeById.get(s.employee_id)?.absent),
    [samplesWithPdf, employeeById]
  )

  const filledCount = useMemo(
    () =>
      requiredSamples.filter((s) => {
        const testType = testTypeById.get(s.test_type_id)
        if (!testType) return false
        return isComplete(valuesBySample[s.sample_id] ?? {}, testType.fields)
      }).length,
    [requiredSamples, testTypeById, valuesBySample]
  )

  const missingLabels = useMemo(() => {
    return requiredSamples
      .filter((s) => {
        const testType = testTypeById.get(s.test_type_id)
        if (!testType) return true
        return !isComplete(valuesBySample[s.sample_id] ?? {}, testType.fields)
      })
      .map((s) => {
        const emp = employeeById.get(s.employee_id)
        const testType = testTypeById.get(s.test_type_id)
        return `${emp?.full_name ?? "Unknown employee"} — ${testType?.name ?? "Unknown test"}`
      })
  }, [requiredSamples, testTypeById, employeeById, valuesBySample])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md flex-1">
          <RosterProgress filled={filledCount} total={requiredSamples.length} />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "individual")}>
            <TabsList>
              <TabsTrigger value="grid" className="cursor-pointer gap-1.5">
                <LayoutGrid className="size-3.5" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="individual" className="cursor-pointer gap-1.5">
                <User className="size-3.5" />
                Individual View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="cursor-pointer" onClick={() => setReviewDialogOpen(true)}>
            <Send />
            Mark Review Complete
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <ResultsGridView
          cycleId={cycleId}
          testTypes={testTypes}
          employees={employees}
          samples={samplesWithPdf}
          valuesBySample={valuesBySample}
          statusBySample={statusBySample}
          updateField={updateField}
          applyOverride={applyOverride}
          getClassification={getClassification}
          onPdfUploaded={onPdfUploaded}
        />
      ) : (
        <ResultsIndividualView
          cycleId={cycleId}
          testTypes={testTypes}
          employees={employees}
          samples={samplesWithPdf}
          valuesBySample={valuesBySample}
          statusBySample={statusBySample}
          updateField={updateField}
          applyOverride={applyOverride}
          getClassification={getClassification}
          onPdfUploaded={onPdfUploaded}
        />
      )}

      <MarkReviewCompleteDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        cycleId={cycleId}
        missing={missingLabels}
      />
    </div>
  )
}
