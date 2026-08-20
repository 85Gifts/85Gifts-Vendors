"use client"

import { useCallback, useEffect, useState } from "react"
import { Landmark, ArrowDownToLine, ArrowUpFromLine, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/adminApi"
import { SettlementWallet, SettlementTransaction } from "@/app/types/admin"

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

const SERVICE_TYPES = [
  "reminder_email",
  "ticket_sale",
  "event_publish",
  "event_creation",
  "ticket_export",
  "bulk_sms",
  "withdrawal",
]

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

export default function AdminSettlements() {
  const [wallet, setWallet] = useState<SettlementWallet | null>(null)
  const [serviceBreakdown, setServiceBreakdown] = useState<Array<{ serviceType: string; total: number; count: number }>>(
    []
  )
  const [walletLoading, setWalletLoading] = useState(true)

  const [items, setItems] = useState<SettlementTransaction[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [query, setQuery] = useState({ page: 1, serviceType: "all" })

  useEffect(() => {
    let cancelled = false
    adminApi
      .settlementWallet()
      .then(({ wallet: w, stats }) => {
        if (cancelled) return
        setWallet(w)
        setServiceBreakdown(stats.collectedByService)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWalletLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.settlementTransactions({
        page: query.page,
        limit: pagination.limit,
        serviceType: query.serviceType === "all" ? undefined : query.serviceType,
        sortOrder: "desc",
      })
      setItems(result.items)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err?.message || "Failed to load settlement transactions")
    } finally {
      setLoading(false)
    }
  }, [query, pagination.limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const vendorLabel = (tx: SettlementTransaction) =>
    tx.vendorId?.businessName || tx.vendorId?.name || tx.vendorId?._id || "—"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Current Balance</CardTitle>
            <Landmark className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{naira.format(Number(wallet?.balance ?? 0))}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle>
            <ArrowDownToLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{naira.format(Number(wallet?.totalCollected ?? 0))}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total Disbursed</CardTitle>
            <ArrowUpFromLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{naira.format(Number(wallet?.totalDisbursed ?? 0))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {serviceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Collected By Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {serviceBreakdown.map((s) => (
                <div key={s.serviceType} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium capitalize">{s.serviceType.replace(/_/g, " ")}</div>
                  <div className="mt-1 text-muted-foreground">
                    {naira.format(Number(s.total || 0))} · {s.count} charge{s.count === 1 ? "" : "s"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={query.serviceType} onValueChange={(v) => setQuery((q) => ({ ...q, serviceType: v, page: 1 }))}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Fee Snapshot</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No settlement transactions found
                </TableCell>
              </TableRow>
            ) : (
              items.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>
                    <div className="font-mono text-xs">{tx.reference}</div>
                    <div className="text-xs text-muted-foreground">{tx.vendorTransactionRef}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{vendorLabel(tx)}</div>
                    {tx.vendorId?.email ? (
                      <div className="text-xs text-muted-foreground">{tx.vendorId.email}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{tx.serviceType?.replace(/_/g, " ")}</TableCell>
                  <TableCell className="font-medium">{naira.format(Number(tx.amount || 0))}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {tx.feeConfigSnapshot
                      ? `${tx.feeConfigSnapshot.feeType} · ${tx.feeConfigSnapshot.feeValue}${
                          tx.feeConfigSnapshot.feeType === "percentage" ? "%" : ""
                        }`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{formatDate(tx.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} · {pagination.total} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" disabled={query.page >= pagination.pages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}