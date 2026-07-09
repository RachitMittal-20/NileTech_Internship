import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CycleHeader } from "@/components/admin/test-cycles/cycle-header"
import { CycleRoster } from "@/components/admin/test-cycles/cycle-roster"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getTestCycle,
  getTestCycleRoster,
  getTestCycleTestTypes,
} from "@/lib/data/test-cycles"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cycle = await getTestCycle(id)
  return {
    title: cycle ? `${cycle.organisations?.name} test cycle — Strong Path Admin` : "Test Cycle",
  }
}

export default async function TestCycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cycle = await getTestCycle(id)
  if (!cycle) notFound()

  const [roster, testTypes] = await Promise.all([
    getTestCycleRoster(id),
    getTestCycleTestTypes(id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <CycleHeader
        cycleId={cycle.id}
        orgName={cycle.organisations?.name ?? "Unknown organisation"}
        scheduledDate={cycle.scheduled_date}
        location={cycle.location}
        status={cycle.status}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Test types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {testTypes.map((type) => (
              <Badge key={type.id} variant="outline">
                {type.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employee roster ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleRoster roster={roster} />
        </CardContent>
      </Card>
    </div>
  )
}
