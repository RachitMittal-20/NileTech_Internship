import { z } from "zod"

export const employeeScopeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({ type: z.literal("count"), count: z.coerce.number().int().min(1, "Enter at least 1.") }),
  z.object({ type: z.literal("subset"), employeeIds: z.array(z.string()).min(1, "Select at least one employee.") }),
])

export const cycleRequestFormSchema = z.object({
  requestedDates: z.array(z.string()).min(1, "Pick at least one preferred date."),
  testTypeIds: z.array(z.string()).min(1, "Select at least one test type."),
  employeeScope: employeeScopeSchema,
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
})

export type CycleRequestFormValues = z.infer<typeof cycleRequestFormSchema>
