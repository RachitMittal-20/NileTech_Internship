"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABEL, STATUS_PIPELINE } from "@/lib/test-cycle-status"

export function TestCyclesToolbar({
  status,
  orgFilter,
  dateFrom,
  dateTo,
  organisations,
}: {
  status: string
  orgFilter: string
  dateFrom: string
  dateTo: string
  organisations: { id: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={status || "all"} onValueChange={(v) => updateParam("status", v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_PIPELINE.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Organization</Label>
          <Select value={orgFilter || "all"} onValueChange={(v) => updateParam("org", v === "all" ? "" : v)}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organisations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            className="w-40"
            value={dateFrom}
            onChange={(e) => updateParam("from", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            className="w-40"
            value={dateTo}
            onChange={(e) => updateParam("to", e.target.value)}
          />
        </div>
      </div>

      <Button className="cursor-pointer" asChild>
        <Link href="/admin/test-cycles/new">
          <Plus />
          New Test Cycle
        </Link>
      </Button>
    </div>
  )
}
