"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ResultFieldDef, ResultFieldValue } from "@/lib/classification"

// The single source of truth for turning a test_types.result_fields entry
// into the right input. Every result field in the seed data is one of these
// three shapes — extending to a new type means adding one case here and to
// the ResultFieldDef["type"] union in lib/classification.ts.
export function DynamicField({
  field,
  value,
  onChange,
  disabled,
  compact,
}: {
  field: ResultFieldDef
  value: ResultFieldValue | undefined
  onChange: (value: ResultFieldValue | undefined) => void
  disabled?: boolean
  compact?: boolean
}) {
  if (field.type === "number") {
    return (
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          value={typeof value === "number" ? value : ""}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value
            onChange(raw === "" ? undefined : Number(raw))
          }}
          className={compact ? "h-9 pr-14" : "pr-14"}
          placeholder="0"
        />
        {field.unit ? (
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
            {field.unit}
          </span>
        ) : null}
      </div>
    )
  }

  if (field.type === "boolean") {
    const stringValue = value === true ? "true" : value === false ? "false" : ""
    return (
      <Select
        value={stringValue || undefined}
        disabled={disabled}
        onValueChange={(v) => onChange(v === "true")}
      >
        <SelectTrigger className={compact ? "h-9 w-full" : "w-full"}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Positive</SelectItem>
          <SelectItem value="false">Negative</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  // text
  if (compact) {
    return (
      <Input
        value={typeof value === "string" ? value : ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-9"
        placeholder={field.label}
      />
    )
  }

  return (
    <Textarea
      value={typeof value === "string" ? value : ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={field.label}
      rows={2}
    />
  )
}
