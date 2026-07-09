"use client"

import { Check, TestTube2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function StepTestTypes({
  testTypes,
  value,
  onChange,
  disabled,
}: {
  testTypes: { id: string; name: string }[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Choose test types</h2>
        <p className="text-sm text-muted-foreground">
          Select every test that will be run during this cycle.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {testTypes.map((type) => {
          const selected = value.includes(type.id)
          return (
            <button
              key={type.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(type.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border px-3 py-5 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 cursor-pointer"
              )}
            >
              {selected ? (
                <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" />
                </span>
              ) : null}
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <TestTube2 className="size-4" />
              </span>
              <span className="font-medium text-foreground">{type.name}</span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length} test type{value.length === 1 ? "" : "s"} selected
      </p>
    </div>
  )
}
