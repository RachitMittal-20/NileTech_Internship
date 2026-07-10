"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FieldBuilder } from "@/components/admin/settings/test-types/field-builder"
import { RuleBuilder } from "@/components/admin/settings/test-types/rule-builder"
import { createTestType, updateTestType } from "@/lib/actions/test-types"
import { testTypeFormSchema, type TestTypeFormValues } from "@/lib/validations/test-type"
import type { TestTypeSummary } from "@/lib/data/test-types-admin"

function toFormValues(testType?: TestTypeSummary | null): TestTypeFormValues {
  if (!testType) {
    return {
      name: "",
      fields: [{ key: "", label: "", type: "number", unit: "" }],
      rules: [{ isDefault: true, label: "Normal", flagged: false }],
    }
  }

  return {
    name: testType.name,
    fields: testType.fields.map((f) => ({ key: f.key, label: f.label, type: f.type, unit: f.unit ?? "" })),
    rules: testType.rules.map((r) =>
      r.default
        ? { isDefault: true, label: r.label, flagged: r.flagged }
        : {
            isDefault: false,
            field: r.field,
            operator: r.operator,
            value: Array.isArray(r.value) ? String(r.value[0]) : String(r.value),
            valueMax: Array.isArray(r.value) ? String(r.value[1]) : "",
            label: r.label,
            flagged: r.flagged,
          }
    ),
  }
}

export function TestTypeForm({ existing }: { existing?: TestTypeSummary | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = Boolean(existing)

  const [values, setValues] = useState<TestTypeFormValues>(() => toFormValues(existing))
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = testTypeFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form for errors.")
      return
    }

    startTransition(async () => {
      const result = existing
        ? await updateTestType(existing.id, parsed.data)
        : await createTestType(parsed.data)

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success(isEdit ? "New version created." : "Test type created.")
      router.push("/admin/settings/test-types")
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {isEdit ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Saving creates a new version of this test type. The current version is kept (but hidden
          from new cycles) so historical results stay interpretable under the rules that were active
          when they were entered.
        </p>
      ) : null}

      <div className="flex max-w-sm flex-col gap-2">
        <Label htmlFor="test-type-name">Name</Label>
        <Input
          id="test-type-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="A1C"
        />
      </div>

      <Card>
        <CardContent>
          <FieldBuilder fields={values.fields} onChange={(fields) => setValues((v) => ({ ...v, fields }))} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <RuleBuilder
            rules={values.rules}
            fields={values.fields}
            onChange={(rules) => setValues((v) => ({ ...v, rules }))}
          />
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/admin/settings/test-types")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" className="cursor-pointer" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save as new version" : "Create test type"}
        </Button>
      </div>
    </form>
  )
}
