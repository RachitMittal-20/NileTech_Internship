import { StyleSheet } from "@react-pdf/renderer"

// Mirrors the app's navy/teal design tokens (app/globals.css) so generated
// reports look like they belong to the same product.
export const BRAND = {
  navy: "#0b2545",
  navyLight: "#3b6da5",
  teal: "#0d9488",
  tealLight: "#5eead4",
  slate: "#64748b",
  border: "#e2e8f0",
  background: "#f8fafc",
  destructive: "#dc2626",
  destructiveBg: "#fef2f2",
  clearBg: "#f0fdfa",
}

export const styles = StyleSheet.create({
  page: {
    paddingTop: 96,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: BRAND.navy,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: BRAND.navy,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerWordmark: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  headerTagline: {
    fontSize: 7.5,
    color: BRAND.tealLight,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDocType: {
    fontSize: 8.5,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  headerConfidential: {
    fontSize: 7,
    color: BRAND.tealLight,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTop: `0.5pt solid ${BRAND.border}`,
    paddingHorizontal: 40,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: BRAND.slate,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: BRAND.background,
    borderRadius: 4,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 18,
  },
  summaryItem: {
    minWidth: 120,
  },
  summaryLabel: {
    fontSize: 7,
    color: BRAND.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
  },
  flaggedBox: {
    backgroundColor: BRAND.destructiveBg,
    borderLeft: `3pt solid ${BRAND.destructive}`,
    borderRadius: 2,
    padding: 10,
    marginBottom: 18,
  },
  flaggedTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.destructive,
    marginBottom: 6,
  },
  flaggedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  flaggedRowText: {
    fontSize: 8.5,
    color: BRAND.navy,
  },
  flaggedRowLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND.destructive,
  },
  table: {
    borderRadius: 2,
    border: `0.5pt solid ${BRAND.border}`,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BRAND.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTop: `0.5pt solid ${BRAND.border}`,
  },
  tableRowFlagged: {
    backgroundColor: BRAND.destructiveBg,
  },
  tableCell: {
    fontSize: 8.5,
    color: BRAND.navy,
  },
  tableCellMuted: {
    fontSize: 8,
    color: BRAND.slate,
  },
  badge: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeFlagged: {
    backgroundColor: BRAND.destructiveBg,
    color: BRAND.destructive,
  },
  badgeClear: {
    backgroundColor: BRAND.clearBg,
    color: BRAND.teal,
  },
  badgePending: {
    backgroundColor: BRAND.background,
    color: BRAND.slate,
  },
})

// Column widths shared by the table header and body rows so cells line up.
export const AGGREGATE_COLS = {
  employee: "22%",
  test: "18%",
  values: "38%",
  classification: "22%",
}

export const INDIVIDUAL_COLS = {
  test: "26%",
  values: "52%",
  classification: "22%",
}
