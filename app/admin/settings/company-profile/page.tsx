import type { Metadata } from "next"

import { CompanyProfileForm } from "@/components/admin/settings/company-profile/company-profile-form"
import { getCompanyProfile } from "@/lib/data/company-profile"

export const metadata: Metadata = {
  title: "Company Profile — Strong Path Admin",
}

export default async function CompanyProfileSettingsPage() {
  const company = await getCompanyProfile()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-foreground">Company profile</h2>
        <p className="text-sm text-muted-foreground">
          Your own organization&apos;s branding and contact details — used on generated PDF reports
          and broadcast emails.
        </p>
      </div>

      <CompanyProfileForm company={company} />
    </div>
  )
}
