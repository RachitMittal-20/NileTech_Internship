import { z } from "zod"

// Shared between the New Test Cycle wizard (client-side step validation)
// and the server actions (which must re-validate independently of the client).
export const testCycleFormSchema = z.object({
  orgId: z.string().uuid("Select an organization."),
  testTypeIds: z.array(z.string().uuid()).min(1, "Select at least one test type."),
  employeeIds: z.array(z.string().uuid()).min(1, "Select at least one employee."),
  scheduledDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
  location: z.string().trim().max(200).optional().or(z.literal("")),
})

export type TestCycleFormValues = z.infer<typeof testCycleFormSchema>
