"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Building2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AddWithdrawalBankModal from "./AddWithdrawalBankModal"
import type { Transaction } from "./RecentTransactions"

interface Wallet {
  balance: number
  currency: string
  pendingWithdrawals: number
  availableBalance: number
  totalEarnings: number
  totalWithdrawals: number
}

interface VendorBank {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault?: boolean
  createdAt?: string
}

interface PerformanceMetricsCardProps {
  wallet: Wallet | null
  walletLoading: boolean
  walletError: string
  currencyFormatter: Intl.NumberFormat
  transactions: Transaction[]
}

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

export default function PerformanceMetricsCard({
  wallet,
  walletLoading,
  walletError,
  currencyFormatter,
  transactions,
}: PerformanceMetricsCardProps) {
  const [withdrawalBankModalOpen, setWithdrawalBankModalOpen] = useState(false)
  const [banks, setBanks] = useState<VendorBank[]>([])
  const [banksLoading, setBanksLoading] = useState(true)
  const [banksError, setBanksError] = useState("")
  const [timeRange, setTimeRange] = useState("90d")

  const fetchBanks = () => {
    setBanksLoading(true)
    setBanksError("")
    fetch("/api/vendor/banks", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.data != null) {
          const raw = data.data.data
          setBanks(Array.isArray(raw) ? raw : [raw])
        } else {
          setBanksError(data?.error?.message ?? data?.error ?? "Failed to load banks")
        }
      })
      .catch(() => setBanksError("Failed to load banks"))
      .finally(() => setBanksLoading(false))
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  const earnings = wallet?.totalEarnings || 0
  const withdrawals = wallet?.totalWithdrawals || 0
  const withdrawalRatio =
    earnings > 0 ? Math.min(100, Math.round((withdrawals / earnings) * 100)) : 0

  // Build a daily earnings/spend series and filter by the selected range.
  const chartData = (() => {
    const buckets = new Map<string, { date: string; credit: number; debit: number }>()
    for (const t of transactions) {
      const d = new Date(t.processedAt || t.createdAt)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (!buckets.has(key)) buckets.set(key, { date: key, credit: 0, debit: 0 })
      const b = buckets.get(key)!
      if (t.type === "credit") b.credit += t.amount
      else b.debit += Math.abs(t.amount)
    }
    const series = Array.from(buckets.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    if (series.length === 0) return series
    const reference = new Date(
      Math.max(
        ...transactions.map((t) => new Date(t.processedAt || t.createdAt).getTime())
      )
    )
    let days = 90
    if (timeRange === "30d") days = 30
    else if (timeRange === "7d") days = 7
    const start = new Date(reference)
    start.setDate(start.getDate() - days)
    return series.filter((s) => new Date(s.date) >= start)
  })()

  return (
    <Card className="p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <TrendingUp className="w-5 h-5 text-primary" />
          Performance Metrics
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[130px] rounded-lg sm:w-[160px]"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWithdrawalBankModalOpen(true)}
            className="shrink-0"
          >
            Add withdrawal bank
          </Button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <CardContent className="px-0 pt-0">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[220px] w-full"
          >
            <AreaChart data={chartData} margin={{ left: 4, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="fillCredit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-credit)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-credit)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillDebit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-debit)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-debit)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) =>
                  `₦${Number(v) >= 1000 ? `${Math.round(v / 1000)}k` : v}`
                }
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
              <Area
                dataKey="debit"
                type="natural"
                fill="url(#fillDebit)"
                stroke="var(--color-debit)"
                strokeWidth={2}
                stackId="b"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      ) : (
        <p className="text-sm text-muted-foreground pb-2">
          No transaction activity yet to chart.
        </p>
      )}

      <div className="space-y-4 mt-2">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-muted-foreground">Total Earnings</span>
            <span className="font-medium dark:text-white">
              {walletLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : walletError ? (
                <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
              ) : (
                currencyFormatter.format(earnings)
              )}
            </span>
          </div>
          <Progress value={100} className="bg-primary/10" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-muted-foreground">Total Withdrawals</span>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">
              {walletLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : walletError ? (
                <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
              ) : (
                currencyFormatter.format(withdrawals)
              )}
            </span>
          </div>
          <Progress
            value={withdrawalRatio}
            className="bg-yellow-500/10 [&>div]:bg-yellow-500"
          />
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-muted-foreground">Wallet Balance</span>
          <span className="font-medium dark:text-white">
            {walletLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : walletError ? (
              <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
            ) : (
              currencyFormatter.format(wallet?.balance || 0)
            )}
          </span>
        </div>
      </div>

      {/* Vendor bank details */}
      <div className="mt-6 pt-4 border-t border-border dark:border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Withdrawal bank
        </h4>
        {banksLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : banksError ? (
          <p className="text-sm text-red-500 dark:text-red-400">{banksError}</p>
        ) : banks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bank account added yet.</p>
        ) : (
          <ul className="space-y-3">
            {banks.map((bank) => (
              <li
                key={bank.id}
                className="text-sm rounded-lg bg-muted/50 p-3 border border-border dark:border-border"
              >
                <div className="font-medium dark:text-white">{bank.bankName}</div>
                <div className="text-muted-foreground mt-0.5 break-words">
                  {bank.accountNumber} · {bank.accountName}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddWithdrawalBankModal
        open={withdrawalBankModalOpen}
        onClose={() => setWithdrawalBankModalOpen(false)}
        onSubmit={() => fetchBanks()}
      />
    </Card>
  )
}
