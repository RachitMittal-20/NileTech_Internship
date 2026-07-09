import { View, Text, Svg, Path, Rect } from "@react-pdf/renderer"

import { BRAND, styles } from "@/lib/pdf/styles"

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

export function ReportHeader({ docType }: { docType: string }) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerBrandRow}>
        <ReportLogoMark />
        <View>
          <Text style={styles.headerWordmark}>Strong Path Diagnostics</Text>
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

const FOOTER_NOTE =
  "This report contains confidential health information intended solely for the named recipient. Strong Path Diagnostics · Automated report — for questions, contact your account administrator."

export function ReportFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{FOOTER_NOTE}</Text>
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
