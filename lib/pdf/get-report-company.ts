import "server-only"

import { getCompanyProfile } from "@/lib/data/company-profile"
import type { ReportCompanyInfo } from "@/lib/pdf/report-chrome"

export async function getReportCompany(): Promise<ReportCompanyInfo> {
  const company = await getCompanyProfile()
  return { name: company.name, logoUrl: company.logoUrl }
}
