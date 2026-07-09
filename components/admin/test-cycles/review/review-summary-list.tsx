import { CheckCircle2, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { classify } from "@/lib/classification"
import type { ResultsPageData } from "@/lib/data/results"

export function ReviewSummaryList({ data }: { data: ResultsPageData }) {
  const testTypeById = new Map(data.testTypes.map((t) => [t.id, t]))
  const employeeById = new Map(data.employees.map((e) => [e.employee_id, e]))

  const rows = data.samples
    .filter((s) => !employeeById.get(s.employee_id)?.absent)
    .map((s) => {
      const testType = testTypeById.get(s.test_type_id)
      const employee = employeeById.get(s.employee_id)
      const result = classify(s.result?.values ?? {}, testType?.rules ?? [], testType?.fields ?? [])
      return {
        sampleId: s.sample_id,
        employeeName: employee?.full_name ?? "Unknown employee",
        testTypeName: testType?.name ?? "Unknown test",
        hasResult: Boolean(s.result),
        result,
      }
    })
    .sort((a, b) => {
      const aFlagged = a.result?.flagged ? 0 : 1
      const bFlagged = b.result?.flagged ? 0 : 1
      if (aFlagged !== bFlagged) return aFlagged - bFlagged
      return a.employeeName.localeCompare(b.employeeName)
    })

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 strokeWidth={1.5} />}
        title="Nothing to review"
        description="No samples were recorded for this cycle."
      />
    )
  }

  const flaggedCount = rows.filter((r) => r.result?.flagged).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="destructive" className="gap-1">
          <TriangleAlert className="size-3" />
          {flaggedCount} flagged
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="size-3" />
          {rows.length - flaggedCount} clear
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.sampleId} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{row.employeeName}</span>
                  <span className="text-xs text-muted-foreground">{row.testTypeName}</span>
                </div>
                {row.hasResult && row.result ? (
                  <Badge variant={row.result.flagged ? "destructive" : "secondary"} className="gap-1">
                    {row.result.flagged ? (
                      <TriangleAlert className="size-3" />
                    ) : (
                      <CheckCircle2 className="size-3" />
                    )}
                    {row.result.label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    No result
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
