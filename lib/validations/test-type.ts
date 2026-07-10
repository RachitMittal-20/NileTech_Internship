import { z } from "zod"

export const resultFieldFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Field key is required.")
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers, and underscores only, starting with a letter."),
  label: z.string().trim().min(1, "Field label is required."),
  type: z.enum(["number", "text", "boolean"]),
  unit: z.string().trim().optional().or(z.literal("")),
})

export type ResultFieldFormValues = z.infer<typeof resultFieldFormSchema>

export const classificationRuleFormSchema = z
  .object({
    isDefault: z.boolean(),
    field: z.string().trim().optional().or(z.literal("")),
    operator: z.enum([">=", "<", "between", "=="]).optional(),
    value: z.string().trim().optional().or(z.literal("")),
    valueMax: z.string().trim().optional().or(z.literal("")),
    label: z.string().trim().min(1, "Label is required."),
    flagged: z.boolean(),
  })
  .superRefine((rule, ctx) => {
    if (rule.isDefault) return
    if (!rule.field) {
      ctx.addIssue({ code: "custom", path: ["field"], message: "Select a field." })
    }
    if (!rule.operator) {
      ctx.addIssue({ code: "custom", path: ["operator"], message: "Select an operator." })
    }
    if (!rule.value) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a value." })
    }
    if (rule.operator === "between" && !rule.valueMax) {
      ctx.addIssue({ code: "custom", path: ["valueMax"], message: "Enter an upper bound." })
    }
  })

export type ClassificationRuleFormValues = z.infer<typeof classificationRuleFormSchema>

export const testTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Test type name is required.").max(100),
  fields: z.array(resultFieldFormSchema).min(1, "Add at least one result field."),
  rules: z.array(classificationRuleFormSchema).min(1, "Add at least one classification rule."),
})

export type TestTypeFormValues = z.infer<typeof testTypeFormSchema>
