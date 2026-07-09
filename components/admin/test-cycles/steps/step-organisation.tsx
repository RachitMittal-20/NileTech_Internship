"use client"

import { useState } from "react"
import { Search, Building2, Check } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function StepOrganisation({
  organisations,
  value,
  onChange,
  disabled,
}: {
  organisations: { id: string; name: string }[]
  value: string
  onChange: (orgId: string) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState("")

  const filtered = organisations.filter((org) =>
    org.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Select an organization</h2>
        <p className="text-sm text-muted-foreground">
          Which client organization is this test cycle for?
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No organizations match your search.</p>
        ) : (
          filtered.map((org) => {
            const selected = org.id === value
            return (
              <button
                key={org.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(org.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 cursor-pointer"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Building2 className="size-4" />
                </span>
                <span className="flex-1 font-medium text-foreground">{org.name}</span>
                {selected ? <Check className="size-4 text-primary" /> : null}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
