import { Document, Page, View, Text } from "@react-pdf/renderer"
import { format } from "date-fns"

import { styles, BRAND } from "@/lib/pdf/styles"
import { ReportHeader, ReportFooter, type ReportCompanyInfo } from "@/lib/pdf/report-chrome"
import type { MonthCount, NamedCount, ClassificationMonthCount } from "@/lib/data/reports"

export interface SummaryReportProps {
  dateFrom: string | null
  dateTo: string | null
  orgName: string | null
  totalSamples: number
  totalFlagged: number
  volumeByMonth: MonthCount[]
  volumeByOrg: NamedCount[]
  volumeByTestType: NamedCount[]
  classificationByMonth: ClassificationMonthCount[]
  generatedAt: string
  company?: ReportCompanyInfo
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max((count / max) * 100, 3) : 0
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 }}>
      <Text style={{ width: 140, fontSize: 8.5, color: BRAND.navy }}>{label}</Text>
      <View style={{ flex: 1, height: 10, backgroundColor: BRAND.background, borderRadius: 2 }}>
        <View
          style={{
            width: `${pct}%`,
            height: 10,
            backgroundColor: BRAND.teal,
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{ width: 28, fontSize: 8.5, color: BRAND.navy, textAlign: "right" }}>{count}</Text>
    </View>
  )
}

export function SummaryReport({
  dateFrom,
  dateTo,
  orgName,
  totalSamples,
  totalFlagged,
  volumeByMonth,
  volumeByOrg,
  volumeByTestType,
  classificationByMonth,
  generatedAt,
  company,
}: SummaryReportProps) {
  const maxMonth = Math.max(1, ...volumeByMonth.map((m) => m.count))
  const maxOrg = Math.max(1, ...volumeByOrg.map((m) => m.count))
  const maxType = Math.max(1, ...volumeByTestType.map((m) => m.count))
  const clearTotal = classificationByMonth.reduce((sum, m) => sum + m.clear, 0)
  const flaggedTotal = classificationByMonth.reduce((sum, m) => sum + m.flagged, 0)

  return (
    <Document title="Reports Summary">
      <Page size="LETTER" style={styles.page}>
        <ReportHeader docType="REPORTS SUMMARY" company={company} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters applied</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Date range</Text>
              <Text style={styles.summaryValue}>
                {dateFrom ? format(new Date(dateFrom), "MMM d, yyyy") : "All time"}
                {" – "}
                {dateTo ? format(new Date(dateTo), "MMM d, yyyy") : "Present"}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Organisation</Text>
              <Text style={styles.summaryValue}>{orgName ?? "All organisations"}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total tests</Text>
              <Text style={styles.summaryValue}>{totalSamples}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Flagged</Text>
              <Text style={styles.summaryValue}>{totalFlagged}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Report generated</Text>
              <Text style={styles.summaryValue}>{format(new Date(generatedAt), "MMM d, yyyy")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test volume by month</Text>
          {volumeByMonth.length === 0 ? (
            <Text style={styles.tableCellMuted}>No data for the selected filters.</Text>
          ) : (
            volumeByMonth.map((m) => <BarRow key={m.month} label={m.month} count={m.count} max={maxMonth} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test volume by organisation</Text>
          {volumeByOrg.length === 0 ? (
            <Text style={styles.tableCellMuted}>No data for the selected filters.</Text>
          ) : (
            volumeByOrg
              .slice(0, 10)
              .map((o) => <BarRow key={o.name} label={o.name} count={o.count} max={maxOrg} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test volume by test type</Text>
          {volumeByTestType.length === 0 ? (
            <Text style={styles.tableCellMuted}>No data for the selected filters.</Text>
          ) : (
            volumeByTestType.map((t) => (
              <BarRow key={t.name} label={t.name} count={t.count} max={maxType} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clear vs. flagged</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Clear</Text>
              <Text style={styles.summaryValue}>{clearTotal}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Flagged</Text>
              <Text style={styles.summaryValue}>{flaggedTotal}</Text>
            </View>
          </View>
        </View>

        <ReportFooter company={company} />
      </Page>
    </Document>
  )
}
