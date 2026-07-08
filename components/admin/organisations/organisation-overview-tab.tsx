import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTRACT_TYPE_LABEL } from "@/lib/validations/organisation"
import type { Tables } from "@/types/database"

const CYCLE_STATUS_LABEL: Record<Tables<"test_cycles">["status"], string> = {
  scheduled: "Scheduled",
  testing: "Testing",
  at_lab: "At lab",
  results_entry: "Results entry",
  review: "Review",
  broadcast: "Broadcast",
  complete: "Complete",
}

export function OrganisationOverviewTab({
  organisation,
  employeeCount,
  cycles,
}: {
  organisation: Tables<"organisations">
  employeeCount: number
  cycles: Pick<Tables<"test_cycles">, "id" | "status">[]
}) {
  const cycleCountsByStatus = cycles.reduce<Record<string, number>>((acc, cycle) => {
    acc[cycle.status] = (acc[cycle.status] ?? 0) + 1
    return acc
  }, {})

  const billingNotes =
    organisation.billing_details &&
    typeof organisation.billing_details === "object" &&
    !Array.isArray(organisation.billing_details)
      ? String((organisation.billing_details as Record<string, unknown>).notes ?? "")
      : ""

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Organization details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <DetailRow label="Address" value={organisation.address} />
          <DetailRow
            label="Contract type"
            value={
              organisation.contract_type
                ? (CONTRACT_TYPE_LABEL[organisation.contract_type] ?? organisation.contract_type)
                : null
            }
          />
          <DetailRow label="Billing notes" value={billingNotes || null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Program summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <DetailRow label="Employees" value={String(employeeCount)} />
          <DetailRow label="Total test cycles" value={String(cycles.length)} />
          {cycles.length === 0 ? (
            <p className="text-muted-foreground">No test cycles run yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {Object.entries(cycleCountsByStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between text-muted-foreground">
                  <span>{CYCLE_STATUS_LABEL[status as Tables<"test_cycles">["status"]]}</span>
                  <span className="tabular-nums text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "—"}</span>
    </div>
  )
}
