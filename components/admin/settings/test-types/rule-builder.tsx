"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ClassificationRuleFormValues, ResultFieldFormValues } from "@/lib/validations/test-type"

export function RuleBuilder({
  rules,
  fields,
  onChange,
}: {
  rules: ClassificationRuleFormValues[]
  fields: ResultFieldFormValues[]
  onChange: (rules: ClassificationRuleFormValues[]) => void
}) {
  function updateRule(index: number, patch: Partial<ClassificationRuleFormValues>) {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index))
  }

  function addRule() {
    onChange([
      ...rules,
      { isDefault: false, field: "", operator: ">=", value: "", valueMax: "", label: "", flagged: true },
    ])
  }

  function addDefaultRule() {
    onChange([...rules, { isDefault: true, label: "Normal", flagged: false }])
  }

  const hasDefault = rules.some((r) => r.isDefault)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Classification rules</h3>
        <div className="flex gap-2">
          {!hasDefault ? (
            <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={addDefaultRule}>
              <Plus className="size-3.5" />
              Add fallback
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={addRule}>
            <Plus className="size-3.5" />
            Add rule
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Rules are evaluated in order — the first match wins. Add one fallback rule (no condition) to
        classify anything the other rules don&apos;t catch.
      </p>

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rules yet — add at least one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg border border-border p-3">
              {rule.isDefault ? (
                <div className="grid grid-cols-[1fr_100px_36px] items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Fallback label</Label>
                    <Input
                      value={rule.label}
                      onChange={(e) => updateRule(index, { label: e.target.value })}
                      placeholder="Normal"
                      className="h-8"
                    />
                  </div>
                  <FlaggedToggle rule={rule} onChange={(flagged) => updateRule(index, { flagged })} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-destructive hover:text-destructive"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_110px_1fr_1fr_100px_36px] items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Field</Label>
                    <Select value={rule.field} onValueChange={(v) => updateRule(index, { field: v })}>
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fields
                          .filter((f) => f.key)
                          .map((f) => (
                            <SelectItem key={f.key} value={f.key}>
                              {f.label || f.key}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Condition</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) =>
                        updateRule(index, { operator: v as ClassificationRuleFormValues["operator"] })
                      }
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">=">&ge;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="between">between</SelectItem>
                        <SelectItem value="==">is</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rule.operator === "==" ? (
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Select value={rule.value} onValueChange={(v) => updateRule(index, { value: v })}>
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Positive</SelectItem>
                          <SelectItem value="false">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        {rule.operator === "between" ? "Min" : "Value"}
                      </Label>
                      <Input
                        type="number"
                        value={rule.value}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  )}

                  {rule.operator === "between" ? (
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        value={rule.valueMax}
                        onChange={(e) => updateRule(index, { valueMax: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  ) : (
                    <div />
                  )}

                  <FlaggedToggle rule={rule} onChange={(flagged) => updateRule(index, { flagged })} />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-destructive hover:text-destructive"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}

              {!rule.isDefault ? (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Result label</Label>
                  <Input
                    value={rule.label}
                    onChange={(e) => updateRule(index, { label: e.target.value })}
                    placeholder="Diabetic"
                    className="h-8 max-w-xs"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FlaggedToggle({
  rule,
  onChange,
}: {
  rule: ClassificationRuleFormValues
  onChange: (flagged: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">Flagged</Label>
      <div className="flex h-8 items-center">
        <Switch checked={rule.flagged} onCheckedChange={onChange} />
      </div>
    </div>
  )
}
