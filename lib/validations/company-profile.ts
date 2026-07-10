import { z } from "zod"

export const companyProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(200),
  contactEmail: z.string().trim().email("Enter a valid email address.").max(200).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileFormSchema>
