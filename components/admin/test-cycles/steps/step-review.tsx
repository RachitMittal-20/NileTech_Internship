import { format, parseISO } from "date-fns"
import { Building2, CalendarClock, MapPin, TestTube2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function StepReview({
  orgName,
  testTypeNames,
  employeeCount,
  date,
  location,
}: {
  orgName: string
  testTypeNames: string[]
  employeeCount: number
  date: string
  location: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Review and create</h2>
        <p className="text-sm text-muted-foreground">
          Double check the details before scheduling this test cycle.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Organization</p>
              <p className="font-medium text-foreground">{orgName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TestTube2 className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Test types</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {testTypeNames.map((name) => (
                  <Badge key={name} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Employees</p>
              <p className="font-medium text-foreground">
                {employeeCount} employee{employeeCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">
                {date ? format(parseISO(date), "MMM d, yyyy") : "—"}
              </p>
            </div>
          </div>

          {location ? (
            <div className="flex items-start gap-3">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{location}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
