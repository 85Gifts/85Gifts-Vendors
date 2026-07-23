"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Package } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface InventorySummary {
  totalItems: number
  inStock: number
  lowStock: number
  outOfStock: number
  discontinued: number
  totalValue: number
  averageStockLevel: number
  reorderNeeded: number
}

const chartConfig = {
  count: { label: "Items" },
  inStock: { label: "In Stock", color: "var(--chart-2)" },
  lowStock: { label: "Low Stock", color: "var(--chart-4)" },
  outOfStock: { label: "Out of Stock", color: "var(--chart-1)" },
  discontinued: { label: "Discontinued", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function InventoryStockChart({
  summary,
}: {
  summary: InventorySummary | null
}) {
  const data = React.useMemo(() => {
    if (!summary) return []
    return [
      { status: "inStock", count: summary.inStock || 0, fill: "var(--color-inStock)" },
      { status: "lowStock", count: summary.lowStock || 0, fill: "var(--color-lowStock)" },
      { status: "outOfStock", count: summary.outOfStock || 0, fill: "var(--color-outOfStock)" },
      { status: "discontinued", count: summary.discontinued || 0, fill: "var(--color-discontinued)" },
    ].filter((d) => d.count > 0)
  }, [summary])

  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-primary" />
          Stock Distribution
        </CardTitle>
        <CardDescription>Breakdown of inventory by stock status</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No inventory data to display yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4"
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
