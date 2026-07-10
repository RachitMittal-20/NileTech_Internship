"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartEmptyState } from "@/components/admin/reports/charts/chart-empty-state"
import { chartTooltipStyle } from "@/components/admin/reports/charts/chart-theme"
import type { NamedCount } from "@/lib/data/reports"

export function VolumeByOrgChart({ data }: { data: NamedCount[] }) {
  // Longest bars first, but recharts renders vertical categories bottom-up —
  // reverse so the highest-volume org appears at the top of the chart.
  const chartData = [...data].slice(0, 10).reverse()
  const height = Math.max(chartData.length * 36, 120)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Test volume by organisation</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(height, 260)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 4, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" name="Tests" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
