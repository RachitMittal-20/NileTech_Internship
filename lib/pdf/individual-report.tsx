import { Document, Page, View, Text } from "@react-pdf/renderer"
import { format } from "date-fns"

import { styles, INDIVIDUAL_COLS } from "@/lib/pdf/styles"
import { ReportHeader, ReportFooter, ClassificationBadgePdf } from "@/lib/pdf/report-chrome"
import type { ReportRow } from "@/lib/pdf/report-data"

export interface IndividualReportProps {
  employeeName: string
  employeeCode: string | null
  orgName: string
  cycleDate: string
  rows: ReportRow[]
  generatedAt: string
}

export function IndividualReport({
  employeeName,
  employeeCode,
  orgName,
  cycleDate,
  rows,
  generatedAt,
}: IndividualReportProps) {
  const flagged = rows.filter((r) => r.classification?.flagged)

  return (
    <Document title={`${employeeName} — Test Results`}>
      <Page size="LETTER" style={styles.page}>
        <ReportHeader docType="INDIVIDUAL RESULTS REPORT" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{employeeName}</Text>
          <View style={styles.summaryCard}>
            {employeeCode ? (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Employee code</Text>
                <Text style={styles.summaryValue}>{employeeCode}</Text>
              </View>
            ) : null}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Organization</Text>
              <Text style={styles.summaryValue}>{orgName}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Test cycle date</Text>
              <Text style={styles.summaryValue}>{format(new Date(cycleDate), "MMM d, yyyy")}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Report generated</Text>
              <Text style={styles.summaryValue}>{format(new Date(generatedAt), "MMM d, yyyy")}</Text>
            </View>
          </View>
        </View>

        {flagged.length > 0 ? (
          <View style={styles.flaggedBox}>
            <Text style={styles.flaggedTitle}>Results Requiring Attention</Text>
            {flagged.map((row) => (
              <View key={row.testTypeName} style={styles.flaggedRow}>
                <Text style={styles.flaggedRowText}>{row.testTypeName}</Text>
                <Text style={styles.flaggedRowLabel}>{row.classification?.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { width: INDIVIDUAL_COLS.test }]}>Test</Text>
              <Text style={[styles.tableHeaderCell, { width: INDIVIDUAL_COLS.values }]}>Result</Text>
              <Text style={[styles.tableHeaderCell, { width: INDIVIDUAL_COLS.classification }]}>
                Classification
              </Text>
            </View>
            {rows.map((row) => (
              <View
                key={row.testTypeName}
                style={[styles.tableRow, row.classification?.flagged ? styles.tableRowFlagged : {}]}
                wrap={false}
              >
                <Text style={[styles.tableCell, { width: INDIVIDUAL_COLS.test }]}>{row.testTypeName}</Text>
                <View style={{ width: INDIVIDUAL_COLS.values }}>
                  {row.fields.map((f) => (
                    <Text key={f.label} style={styles.tableCell}>
                      {f.label}: {f.value}
                      {f.unit ? ` ${f.unit}` : ""}
                    </Text>
                  ))}
                </View>
                <View style={{ width: INDIVIDUAL_COLS.classification }}>
                  <ClassificationBadgePdf result={row.classification} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  )
}
