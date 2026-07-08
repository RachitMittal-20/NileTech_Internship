import { z } from "zod"

// Shared between the add/edit dialog (client-side react-hook-form
// validation), the bulk-upload preview step, and the server actions (which
// must re-validate independently of the client).
export const employeeFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(200),
  email: z.string().trim().email("Enter a valid email address.").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  dob: z.string().trim().optional().or(z.literal("")),
  employeeCode: z.string().trim().max(50).optional().or(z.literal("")),
  orgId: z.string().uuid("Select an organization."),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

// Looser row-level schema used for bulk-import validation, where dob arrives
// as free text from a spreadsheet and org is resolved separately by name/id.
export const employeeImportRowSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  dob: z.string().trim().optional().or(z.literal("")),
  employeeCode: z.string().trim().max(50).optional().or(z.literal("")),
})

export type EmployeeImportRow = z.infer<typeof employeeImportRowSchema>
