import { z } from "zod"

// Shared between the create/edit sheet (client-side react-hook-form validation)
// and the server actions (which must re-validate independently of the client).
export const organisationFormSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required.").max(200),
  contactName: z.string().trim().max(200).optional().or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(200)
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  contractType: z.enum(["per_test", "annual", "custom"]).optional().or(z.literal("")),
  billingNotes: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type OrganisationFormValues = z.infer<typeof organisationFormSchema>

export const CONTRACT_TYPE_LABEL: Record<string, string> = {
  per_test: "Per-test billing",
  annual: "Annual contract",
  custom: "Custom",
}
