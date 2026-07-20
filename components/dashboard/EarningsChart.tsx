"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Transaction } from "./RecentTransactions"

const chartConfig = {
  credit: {
    label: "Earnings",
    color: "var(--chart-2)",
  },
  debit: {
    label: "Spent",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function buildSeries(transactions: Transaction[]) {
  const buckets = new Map<string, { credit: number; debit: number }>()

  for (const t of transactions) {
    const day = new Date(t.processedAt || t.createdAt).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    )
    if (!buckets.has(day)) buckets.set(day, { credit: 0, debit: 0 })
    const bucket = buckets.get(day)!
    if (t.type === "credit") bucket.credit += t.amount
    else bucket.debit += Math.abs(t.amount)
  }

  return Array.from(buckets.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

export default function EarningsChart({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [mode, setMode] = React.useState<"all" | "earnings">("all")
  const data = React.useMemo(() => buildSeries(transactions), [transactions])

  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            No transaction activity yet to chart.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Earnings will appear here once you start receiving payments.
        </CardContent>
      </Card>
    )
  }

  const showDebit = mode === "all"

  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            {showDebit
              ? "Credit vs. debit activity across your transactions"
              : "Earnings across your transactions"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "all" ? "default" : "outline"}
            onClick={() => setMode("all")}
          >
            All activity
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "earnings" ? "default" : "outline"}
            onClick={() => setMode("earnings")}
          >
            Earnings only
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart
            data={data}
            margin={{ left: 4, right: 4, top: 8 }}
          >
            <defs>
              <linearGradient id="fillCredit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-credit)"
                  stopOpacity={0.7}
                />
                <stop offset="95%" stopColor="var(--color-credit)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillDebit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-debit)"
                  stopOpacity={0.5}
                />
                <stop offset="95%" stopColor="var(--color-debit)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `₦${Number(v) >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground capitalize">{name}</span>
                      <span className="font-medium tabular-nums">
                        ₦{Number(value).toLocaleString("en-NG")}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="credit"
              type="natural"
              fill="url(#fillCredit)"
              stroke="var(--color-credit)"
              strokeWidth={2}
              stackId="a"
            />
            {showDebit && (
              <Area
                dataKey="debit"
                type="natural"
                fill="url(#fillDebit)"
                stroke="var(--color-debit)"
                strokeWidth={2}
                stackId="b"
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
