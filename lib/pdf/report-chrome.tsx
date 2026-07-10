import { View, Text, Svg, Path, Rect, Image } from "@react-pdf/renderer"

import { BRAND, styles } from "@/lib/pdf/styles"
import { SITE } from "@/lib/constants"

export function ReportLogoMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Rect width={32} height={32} rx={8} fill={BRAND.teal} />
      <Path
        d="M9 17.5L13 21.5L23 10.5"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}

export interface ReportCompanyInfo {
  name: string
  logoUrl: string | null
}

export function ReportHeader({
  docType,
  company,
}: {
  docType: string
  company?: ReportCompanyInfo
}) {
  const companyName = company?.name ?? SITE.name

  return (
    <View style={styles.header} fixed>
      <View style={styles.headerBrandRow}>
        {company?.logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop
          <Image src={company.logoUrl} style={{ width: 22, height: 22, borderRadius: 4 }} />
        ) : (
          <ReportLogoMark />
        )}
        <View>
          <Text style={styles.headerWordmark}>{companyName}</Text>
          <Text style={styles.headerTagline}>Enterprise diagnostic testing, built for the workplace.</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerDocType}>{docType}</Text>
        <Text style={styles.headerConfidential}>CONFIDENTIAL — HEALTH INFORMATION</Text>
      </View>
    </View>
  )
}

export function ReportFooter({ company }: { company?: ReportCompanyInfo }) {
  const companyName = company?.name ?? SITE.name
  const footerNote = `This report contains confidential health information intended solely for the named recipient. ${companyName} · Automated report — for questions, contact your account administrator.`

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{footerNote}</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  )
}

export function ClassificationBadgePdf({
  result,
}: {
  result: { label: string; flagged: boolean } | null
}) {
  if (!result) {
    return (
      <Text style={[styles.badge, styles.badgePending]}>Pending</Text>
    )
  }
  return (
    <Text style={[styles.badge, result.flagged ? styles.badgeFlagged : styles.badgeClear]}>
      {result.label}
    </Text>
  )
}
