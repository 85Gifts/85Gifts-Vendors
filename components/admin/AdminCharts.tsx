"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, PieChart as PieIcon, BarChart3, Coins } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { adminApi } from "@/lib/adminApi"
import { AdminEventStatus, WalletTransaction, SettlementTransaction } from "@/app/types/admin"

const EVENT_STATUSES: AdminEventStatus[] = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "cancelled",
  "ended",
]

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  cancelled: "Cancelled",
  ended: "Ended",
}

const STATUS_COLOR: Record<string, string> = {
  draft: "var(--muted-foreground)",
  pending_review: "#f59e0b",
  published: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#ef4444",
  ended: "#3b82f6",
}

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
]

const paletteColor = (index: number) => PALETTE[index % PALETTE.length]

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

const compactNgn = (value: number) =>
  `₦${Math.abs(value) >= 1000 ? `${Math.round(Math.abs(value) / 1000)}k` : Math.round(Math.abs(value))}`

interface FeeBucket {
  ts: number
  label: string
  fees: number
}

interface ServiceSlice {
  serviceType: string
  total: number
  count: number
}

interface Slice {
  name: string
  value: number
}

function buildFeeSeries(items: SettlementTransaction[]): FeeBucket[] {
  const buckets = new Map<number, number>()
  for (const tx of items) {
    const iso = tx.createdAt || tx.updatedAt
    if (!iso) continue
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    buckets.set(day, (buckets.get(day) || 0) + Number(tx.amount || 0))
  }
  return Array.from(buckets.entries())
    .map(([ts, fees]) => ({
      ts,
      label: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fees,
    }))
    .sort((a, b) => a.ts - b.ts)
}

function buildCategorySlices(items: WalletTransaction[]): Slice[] {
  const map = new Map<string, number>()
  for (const tx of items) {
    const key = (tx.category || "other").replace(/_/g, " ")
    map.set(key, (map.get(key) || 0) + Number(tx.amount || 0))
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

interface ChartCardShellProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  loading: boolean
  isEmpty: boolean
  emptyLabel: string
  children: React.ReactNode
}

function ChartCardShell({
  icon: Icon,
  title,
  description,
  action,
  loading,
  isEmpty,
  emptyLabel,
  children,
}: ChartCardShellProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : isEmpty ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

function RangeToggle({ range, onRangeChange }: { range: "7d" | "30d"; onRangeChange: (r: "7d" | "30d") => void }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:justify-end">
      {(["7d", "30d"] as const).map((r) => (
        <Button
          key={r}
          size="sm"
          variant={range === r ? "default" : "outline"}
          onClick={() => onRangeChange(r)}
          className="h-7 px-2 text-xs"
        >
          {r === "7d" ? "7 days" : "30 days"}
        </Button>
      ))}
    </div>
  )
}

function FeeIncomeArea({ series, range }: { series: FeeBucket[]; range: "7d" | "30d" }) {
  const config = { fees: { label: "Fees", color: "var(--chart-2)" } } satisfies ChartConfig

  const visible = useMemo(() => {
    if (range === "30d") return series
    const now = Date.now()
    const cutoff = now - 7 * 24 * 60 * 60 * 1000
    return series.filter((b) => b.ts >= cutoff)
  }, [series, range])

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <AreaChart data={visible} margin={{ left: 4, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="fillFees" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-fees)" stopOpacity={0.7} />
            <stop offset="95%" stopColor="var(--color-fees)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v) => compactNgn(Number(v))} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-muted-foreground">Fees collected</span>
                  <span className="font-medium tabular-nums">{NGN.format(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <Area dataKey="fees" type="natural" fill="url(#fillFees)" stroke="var(--color-fees)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}

function ServiceDonut({ slices }: { slices: ServiceSlice[] }) {
  const config = { value: { label: "Total" } } satisfies ChartConfig
  const total = useMemo(() => slices.reduce((s, slice) => s + Number(slice.total || 0), 0), [slices])
  const data: Slice[] = slices.map((s) => ({
    name: s.serviceType.replace(/_/g, " "),
    value: Number(s.total || 0),
  }))

  return (
    <div>
      <div className="relative mx-auto">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[240px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground capitalize">{name}</span>
                      <span className="font-medium tabular-nums">{NGN.format(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={paletteColor(i)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{compactNgn(total)}</div>
          <div className="text-xs text-muted-foreground">Collected</div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {slices.map((slice, i) => (
          <div key={slice.serviceType} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: paletteColor(i) }} />
              {slice.serviceType.replace(/_/g, " ")}
            </span>
            <span className="text-muted-foreground text-xs">
              {NGN.format(Number(slice.total || 0))} · {slice.count} charges
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventStatusBar({ totals }: { totals: { status: string; count: number }[] }) {
  const config = { count: { label: "Events" } } satisfies ChartConfig
  const data = totals.map((t) => ({ status: STATUS_LABEL[t.status] || t.status, count: t.count }))

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
        <YAxis type="category" dataKey="status" width={104} tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-muted-foreground capitalize">{name}</span>
                  <span className="font-medium tabular-nums">{Number(value).toLocaleString()}</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="count" name="Events" radius={[0, 4, 4, 0]} barSize={22}>
          {data.map((row, i) => (
            <Cell key={row.status} fill={STATUS_COLOR[totals[i].status] || paletteColor(i)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

function WalletMixDonut({ slices }: { slices: Slice[] }) {
  const config = { value: { label: "Total" } } satisfies ChartConfig
  const total = useMemo(() => slices.reduce((s, slice) => s + slice.value, 0), [slices])

  return (
    <div>
      <div className="relative mx-auto">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[240px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground capitalize">{name}</span>
                      <span className="font-medium tabular-nums">{NGN.format(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
              {slices.map((_, i) => (
                <Cell key={i} fill={paletteColor(i)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{compactNgn(total)}</div>
          <div className="text-xs text-muted-foreground">Volume</div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {slices.map((slice, i) => (
          <div key={slice.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: paletteColor(i) }} />
              {slice.name}
            </span>
            <span className="text-muted-foreground text-xs">{NGN.format(slice.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminCharts() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [range, setRange] = useState<"7d" | "30d">("30d")

  const [feeSeries, setFeeSeries] = useState<FeeBucket[]>([])
  const [serviceSlices, setServiceSlices] = useState<ServiceSlice[]>([])
  const [statusTotals, setStatusTotals] = useState<{ status: string; count: number }[]>([])
  const [categorySlices, setCategorySlices] = useState<Slice[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError("")
      try {
        const [wallet, settlList, statusResults, walletList] = await Promise.all([
          adminApi.settlementWallet(),
          adminApi.settlementTransactions({ limit: 100 }),
          Promise.all(EVENT_STATUSES.map((status) => adminApi.listEvents({ status, limit: 1 }))),
          adminApi.walletTransactions({ limit: 100 }),
        ])
        if (cancelled) return

        setFeeSeries(buildFeeSeries(settlList.items))
        setServiceSlices(wallet.stats.collectedByService ?? [])
        setStatusTotals(
          EVENT_STATUSES.map((status, i) => ({
            status,
            count: statusResults[i].pagination?.total ?? 0,
          }))
        )
        setCategorySlices(buildCategorySlices(walletList.items))
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load charts")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCardShell
        icon={TrendingUp}
        title="Platform Fee Income"
        description="Daily fee collections from vendor charges"
        loading={loading}
        isEmpty={feeSeries.length === 0}
        emptyLabel="No fee collections recorded yet."
        action={<RangeToggle range={range} onRangeChange={setRange} />}
      >
        <FeeIncomeArea series={feeSeries} range={range} />
      </ChartCardShell>

      <ChartCardShell
        icon={PieIcon}
        title="Fees by Service"
        description="Fees collected, broken down by service type"
        loading={loading}
        isEmpty={serviceSlices.length === 0}
        emptyLabel="No service fee data yet."
      >
        <ServiceDonut slices={serviceSlices} />
      </ChartCardShell>

      <ChartCardShell
        icon={BarChart3}
        title="Event Status"
        description="Events in the pipeline, grouped by status"
        loading={loading}
        isEmpty={statusTotals.every((s) => s.count === 0)}
        emptyLabel="No events yet."
      >
        <EventStatusBar totals={statusTotals} />
      </ChartCardShell>

      <ChartCardShell
        icon={Coins}
        title="Wallet Activity Mix"
        description="Vendor wallet activity by category (recent)"
        loading={loading}
        isEmpty={categorySlices.length === 0}
        emptyLabel="No wallet activity yet."
      >
        <WalletMixDonut slices={categorySlices} />
      </ChartCardShell>
    </div>
  )
}