import "server-only"

import { createClient } from "@/lib/supabase/server"
import { SITE } from "@/lib/constants"

export interface CompanyProfile {
  id: string
  name: string
  logoUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
}

// company_profile is a singleton row seeded by migration, but fall back to
// SITE defaults defensively in case it's ever missing.
export async function getCompanyProfile(): Promise<CompanyProfile> {
  const supabase = await createClient()
  const { data } = await supabase.from("company_profile").select("*").limit(1).maybeSingle()

  if (!data) {
    return { id: "", name: SITE.name, logoUrl: null, contactEmail: null, contactPhone: null, address: null }
  }

  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logo_url,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address,
  }
}
