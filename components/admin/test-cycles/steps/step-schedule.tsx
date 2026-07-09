"use client"

import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function StepSchedule({
  date,
  location,
  onDateChange,
  onLocationChange,
  disabled,
}: {
  date: string
  location: string
  onDateChange: (date: string) => void
  onLocationChange: (location: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Date and location</h2>
        <p className="text-sm text-muted-foreground">When and where will testing take place?</p>
      </div>

      <div className="grid max-w-md gap-4">
        <div className="flex flex-col gap-2">
          <Label>Scheduled date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full cursor-pointer justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="size-4" />
                {date ? format(parseISO(date), "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={date ? parseISO(date) : undefined}
                onSelect={(d) => onDateChange(d ? format(d, "yyyy-MM-dd") : "")}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cycle-location">Location</Label>
          <Input
            id="cycle-location"
            placeholder="e.g. Main office, 2nd floor conference room"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
