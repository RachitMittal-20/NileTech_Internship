import type { Json } from "@/types/database"

export type ResultFieldType = "number" | "text" | "boolean"

export interface ResultFieldDef {
  key: string
  label: string
  type: ResultFieldType
  unit?: string
}

export type ResultFieldValue = number | string | boolean

export interface ClassificationOverride {
  classification: "clear" | "flagged"
  reason: string
  overriddenBy: string
  overriddenAt: string
}

// Result values are keyed by field key. `_override` is a reserved key (no
// seeded test_type field uses a leading underscore) that records a manual
// classification override without needing a schema migration. TS can't
// express "every key but _override maps to a scalar" with a plain index
// signature, so field reads cast to ResultFieldValue at the few call sites
// below — safe because field keys never collide with the reserved key.
export interface ResultValues {
  [key: string]: ResultFieldValue | ClassificationOverride | undefined
}

export function getOverride(values: ResultValues): ClassificationOverride | undefined {
  return values._override as ClassificationOverride | undefined
}

export function getFieldValue(values: ResultValues, key: string): ResultFieldValue | undefined {
  return values[key] as ResultFieldValue | undefined
}

type RuleOperator = ">=" | "<" | "between" | "=="

export interface ClassificationRule {
  field?: string
  operator?: RuleOperator
  value?: number | boolean | [number, number]
  default?: boolean
  label: string
  flagged: boolean
}

export interface ClassificationResult {
  label: string
  flagged: boolean
  overridden: boolean
}

// test_types.result_fields / classification_rules are stored as JSONB and
// typed as `Json` by the generated Supabase types, so they need defensive
// parsing before use — malformed data degrades to an empty list rather than
// throwing and breaking the whole page.
export function parseResultFields(json: Json): ResultFieldDef[] {
  if (!Array.isArray(json)) return []
  return json.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return []
    const obj = item as Record<string, Json>
    if (typeof obj.key !== "string" || typeof obj.label !== "string") return []
    if (obj.type !== "number" && obj.type !== "text" && obj.type !== "boolean") return []
    return [
      {
        key: obj.key,
        label: obj.label,
        type: obj.type,
        unit: typeof obj.unit === "string" ? obj.unit : undefined,
      },
    ]
  })
}

export function parseClassificationRules(json: Json): ClassificationRule[] {
  if (!Array.isArray(json)) return []

  const rules: ClassificationRule[] = []

  for (const item of json) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const obj = item as Record<string, Json>
    if (typeof obj.label !== "string" || typeof obj.flagged !== "boolean") continue

    if (obj.default === true) {
      rules.push({ default: true, label: obj.label, flagged: obj.flagged })
      continue
    }

    if (typeof obj.field !== "string") continue
    const operator = obj.operator
    if (operator !== ">=" && operator !== "<" && operator !== "between" && operator !== "==") {
      continue
    }

    const value = parseRuleValue(operator, obj.value)
    if (value === undefined) continue

    rules.push({ field: obj.field, operator, value, label: obj.label, flagged: obj.flagged })
  }

  return rules
}

function parseRuleValue(
  operator: RuleOperator,
  value: Json
): number | boolean | [number, number] | undefined {
  if (operator === "between") {
    if (Array.isArray(value) && value.length === 2 && value.every((v) => typeof v === "number")) {
      return [value[0], value[1]] as [number, number]
    }
    return undefined
  }
  if (operator === "==") {
    return typeof value === "boolean" ? value : undefined
  }
  return typeof value === "number" ? value : undefined
}

function evaluateRule(fieldValue: ResultFieldValue, operator: RuleOperator, ruleValue: unknown): boolean {
  switch (operator) {
    case ">=":
      return typeof fieldValue === "number" && typeof ruleValue === "number" && fieldValue >= ruleValue
    case "<":
      return typeof fieldValue === "number" && typeof ruleValue === "number" && fieldValue < ruleValue
    case "between": {
      if (typeof fieldValue !== "number" || !Array.isArray(ruleValue)) return false
      const [min, max] = ruleValue as [number, number]
      return fieldValue >= min && fieldValue <= max
    }
    case "==":
      return fieldValue === ruleValue
    default:
      return false
  }
}

// Evaluates rules in order; the first match wins. A `default: true` rule
// (always present as the last entry in the seeded data) acts as the
// fallback when no field-specific rule matches — but only once at least one
// field has an actual value, otherwise an untouched sample would show as
// "Negative"/clear before anyone has entered anything.
export function classify(
  values: ResultValues,
  rules: ClassificationRule[],
  fields: ResultFieldDef[]
): ClassificationResult | null {
  const override = getOverride(values)
  if (override) {
    const isFlagged = override.classification === "flagged"
    return { label: isFlagged ? "Flagged (overridden)" : "Clear (overridden)", flagged: isFlagged, overridden: true }
  }

  if (!hasAnyValue(values, fields)) return null

  for (const rule of rules) {
    if (rule.default) {
      return { label: rule.label, flagged: rule.flagged, overridden: false }
    }
    if (!rule.field || !rule.operator) continue

    const fieldValue = getFieldValue(values, rule.field)
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") continue

    if (evaluateRule(fieldValue, rule.operator, rule.value)) {
      return { label: rule.label, flagged: rule.flagged, overridden: false }
    }
  }

  return null
}

export function hasAnyValue(values: ResultValues, fields: ResultFieldDef[]): boolean {
  return fields.some((f) => {
    const v = getFieldValue(values, f.key)
    return v !== undefined && v !== null && v !== ""
  })
}

export function isComplete(values: ResultValues, fields: ResultFieldDef[]): boolean {
  return fields.every((f) => {
    const v = getFieldValue(values, f.key)
    return v !== undefined && v !== null && v !== ""
  })
}
