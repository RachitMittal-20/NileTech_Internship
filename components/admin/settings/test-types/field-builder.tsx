"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ResultFieldFormValues } from "@/lib/validations/test-type"

export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: ResultFieldFormValues[]
  onChange: (fields: ResultFieldFormValues[]) => void
}) {
  function updateField(index: number, patch: Partial<ResultFieldFormValues>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index))
  }

  function addField() {
    onChange([...fields, { key: "", label: "", type: "number", unit: "" }])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Result fields</h3>
        <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={addField}>
          <Plus className="size-3.5" />
          Add field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fields yet — add at least one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_120px_100px_36px] items-end gap-2 rounded-lg border border-border p-3"
            >
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Key</Label>
                <Input
                  value={field.key}
                  onChange={(e) => updateField(index, { key: e.target.value })}
                  placeholder="a1c"
                  className="h-8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Hemoglobin A1C"
                  className="h-8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(v) => updateField(index, { type: v as ResultFieldFormValues["type"] })}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="boolean">Positive/Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input
                  value={field.unit}
                  onChange={(e) => updateField(index, { unit: e.target.value })}
                  placeholder="mg/dL"
                  disabled={field.type !== "number"}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer text-destructive hover:text-destructive"
                onClick={() => removeField(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
