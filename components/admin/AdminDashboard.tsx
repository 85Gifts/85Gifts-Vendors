"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Users,
  CalendarCheck,
  Clock,
  Ticket,
  Banknote,
  Hourglass,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/lib/adminApi"
import { DashboardStats } from "@/app/types/admin"
import AdminCharts from "./AdminCharts"

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    adminApi
      .dashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load dashboard stats")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cards = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: "Total Vendors",
        value: stats.totalVendors.toLocaleString(),
        sub: `+${stats.newVendorsLast30Days} in last 30 days`,
        icon: Users,
      },
      {
        label: "Published Events",
        value: stats.totalPublishedEvents.toLocaleString(),
        sub: `${stats.pendingEventReviews} pending review`,
        icon: CalendarCheck,
      },
      {
        label: "Pending Reviews",
        value: stats.pendingEventReviews.toLocaleString(),
        sub: "Events awaiting review",
        icon: Clock,
      },
      {
        label: "Total Bookings",
        value: stats.totalBookings.toLocaleString(),
        sub: "All payment statuses",
        icon: Ticket,
      },
      {
        label: "Paid Revenue",
        value: naira.format(stats.paidBookingsRevenue),
        sub: "Sum of paid booking amounts",
        icon: Banknote,
      },
      {
        label: "Pending Withdrawals",
        value: `${stats.pendingWithdrawalsCount} · ${naira.format(stats.pendingWithdrawalsAmount)}`,
        sub: "Vendor withdrawals in queue",
        icon: Hourglass,
      },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Platform Overview</h2>
          <p className="text-sm text-muted-foreground">
            High-level activity across the vendor platform
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {stats?.totalVendors ?? 0} vendors
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AdminCharts />
    </div>
  )
}