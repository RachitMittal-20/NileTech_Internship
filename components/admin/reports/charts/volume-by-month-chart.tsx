"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartEmptyState } from "@/components/admin/reports/charts/chart-empty-state"
import { chartTooltipStyle } from "@/components/admin/reports/charts/chart-theme"
import type { MonthCount } from "@/lib/data/reports"

export function VolumeByMonthChart({ data }: { data: MonthCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Test volume by month</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                width={32}
              />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" name="Tests" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
