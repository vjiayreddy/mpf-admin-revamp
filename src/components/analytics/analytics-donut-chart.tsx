"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { colorForLabel } from "@/lib/analytics/partition"

type DonutItem = {
  label: string
  value: number
}

type AnalyticsDonutChartProps = {
  items: DonutItem[]
  height?: number
  className?: string
}

export function AnalyticsDonutChart({
  items,
  height = 220,
  className,
}: AnalyticsDonutChartProps) {
  const data = items
    .map((item) => ({
      name: item.label,
      value: Number(item.value) || 0,
      fill: colorForLabel(item.label),
    }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div
        className="text-muted-foreground flex items-center justify-center text-sm"
        style={{ height }}
      >
        No chart data
      </div>
    )
  }

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="transparent"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string, name: string) => [
              value,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
