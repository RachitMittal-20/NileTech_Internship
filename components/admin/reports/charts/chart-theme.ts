import type { CSSProperties } from "react"

// Shared tooltip styling so every recharts chart in Reports looks consistent
// and respects the app's light/dark theme tokens instead of hardcoded colors.
export const chartTooltipStyle: CSSProperties = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: 12,
  color: "var(--popover-foreground)",
}

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]
