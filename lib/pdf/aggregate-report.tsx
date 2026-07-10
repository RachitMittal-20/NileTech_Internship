import { Document, Page, View, Text } from "@react-pdf/renderer"
import { format } from "date-fns"

import { styles, AGGREGATE_COLS } from "@/lib/pdf/styles"
import { ReportHeader, ReportFooter, ClassificationBadgePdf, type ReportCompanyInfo } from "@/lib/pdf/report-chrome"
import type { ReportRow } from "@/lib/pdf/report-data"

export interface AggregateReportProps {
  orgName: string
  cycleDate: string
  location: string | null
  testTypeNames: string[]
  rows: ReportRow[]
  generatedAt: string
  company?: ReportCompanyInfo
}

export function AggregateReport({
  orgName,
  cycleDate,
  location,
  testTypeNames,
  rows,
  generatedAt,
  company,
}: AggregateReportProps) {
  const flagged = rows.filter((r) => r.classification?.flagged)

  return (
    <Document title={`${orgName} — Test Cycle Results`}>
      <Page size="LETTER" style={styles.page}>
        <ReportHeader docType="AGGREGATE RESULTS REPORT" company={company} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{orgName}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Test cycle date</Text>
              <Text style={styles.summaryValue}>{format(new Date(cycleDate), "MMM d, yyyy")}</Text>
            </View>
            {location ? (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{location}</Text>
              </View>
            ) : null}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Test types</Text>
              <Text style={styles.summaryValue}>{testTypeNames.join(", ") || "—"}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Employees tested</Text>
              <Text style={styles.summaryValue}>{new Set(rows.map((r) => r.employeeId)).size}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Report generated</Text>
              <Text style={styles.summaryValue}>{format(new Date(generatedAt), "MMM d, yyyy")}</Text>
            </View>
          </View>
        </View>

        {flagged.length > 0 ? (
          <View style={styles.flaggedBox}>
            <Text style={styles.flaggedTitle}>Flagged Results ({flagged.length})</Text>
            {flagged.map((row) => (
              <View key={`${row.employeeId}-${row.testTypeName}`} style={styles.flaggedRow}>
                <Text style={styles.flaggedRowText}>
                  {row.employeeName} — {row.testTypeName}
                </Text>
                <Text style={styles.flaggedRowLabel}>{row.classification?.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Results</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { width: AGGREGATE_COLS.employee }]}>Employee</Text>
              <Text style={[styles.tableHeaderCell, { width: AGGREGATE_COLS.test }]}>Test</Text>
              <Text style={[styles.tableHeaderCell, { width: AGGREGATE_COLS.values }]}>Result</Text>
              <Text style={[styles.tableHeaderCell, { width: AGGREGATE_COLS.classification }]}>
                Classification
              </Text>
            </View>
            {rows.map((row) => (
              <View
                key={`${row.employeeId}-${row.testTypeName}`}
                style={[styles.tableRow, row.classification?.flagged ? styles.tableRowFlagged : {}]}
                wrap={false}
              >
                <View style={{ width: AGGREGATE_COLS.employee }}>
                  <Text style={styles.tableCell}>{row.employeeName}</Text>
                  {row.employeeCode ? (
                    <Text style={styles.tableCellMuted}>{row.employeeCode}</Text>
                  ) : null}
                </View>
                <Text style={[styles.tableCell, { width: AGGREGATE_COLS.test }]}>{row.testTypeName}</Text>
                <View style={{ width: AGGREGATE_COLS.values }}>
                  {row.fields.map((f) => (
                    <Text key={f.label} style={styles.tableCell}>
                      {f.label}: {f.value}
                      {f.unit ? ` ${f.unit}` : ""}
                    </Text>
                  ))}
                </View>
                <View style={{ width: AGGREGATE_COLS.classification }}>
                  <ClassificationBadgePdf result={row.classification} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <ReportFooter company={company} />
      </Page>
    </Document>
  )
}
