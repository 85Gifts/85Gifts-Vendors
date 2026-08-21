"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/adminApi"
import {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransactionCategory,
} from "@/app/types/admin"

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

const TYPE_FILTERS: Array<WalletTransactionType | "all"> = ["all", "credit", "debit"]

const CATEGORY_FILTERS: Array<WalletTransactionCategory | "all"> = [
  "all",
  "sale",
  "refund",
  "withdrawal",
  "funding",
  "bonus",
  "adjustment",
  "fee",
  "reversal",
]

const STATUS_FILTERS: Array<WalletTransactionStatus | "all"> = [
  "all",
  "pending",
  "completed",
  "failed",
  "reversed",
]

const TYPE_STYLE: Record<string, string> = {
  credit: "text-green-600 bg-green-100",
  debit: "text-red-600 bg-red-100",
}

const STATUS_STYLE: Record<string, string> = {
  pending: "text-amber-600 bg-amber-100",
  completed: "text-green-600 bg-green-100",
  failed: "text-red-600 bg-red-100",
  reversed: "text-muted-foreground bg-muted",
}

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

export default function AdminWalletTransactions() {
  const [items, setItems] = useState<WalletTransaction[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [draftReference, setDraftReference] = useState("")
  const [query, setQuery] = useState({
    page: 1,
    type: "all" as WalletTransactionType | "all",
    category: "all" as WalletTransactionCategory | "all",
    status: "all" as WalletTransactionStatus | "all",
    reference: "",
  })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.walletTransactions({
        page: query.page,
        limit: pagination.limit,
        type: query.type === "all" ? undefined : query.type,
        category: query.category === "all" ? undefined : query.category,
        status: query.status === "all" ? undefined : query.status,
        reference: query.reference || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      setItems(result.items)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err?.message || "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [query, pagination.limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const applyFilters = () => {
    setQuery((q) => ({
      page: 1,
      type: q.type,
      category: q.category,
      status: q.status,
      reference: draftReference.trim(),
    }))
  }

  const changeFilter = (
    key: "type" | "category" | "status",
    value: string
  ) => {
    setQuery((q) => ({ ...q, [key]: value, page: 1 }))
  }

  const vendorLabel = (tx: WalletTransaction) =>
    tx.vendor?.businessName || tx.vendor?.name || tx.vendorId || "—"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={draftReference}
            onChange={(e) => setDraftReference(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search reference"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={query.type} onValueChange={(v) => changeFilter("type", v)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={query.category} onValueChange={(v) => changeFilter("category", v)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_FILTERS.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c === "all" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={query.status} onValueChange={(v) => changeFilter("status", v)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Processed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              items.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>
                    <div className="font-mono text-xs">{tx.reference}</div>
                    {tx.description ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">{tx.description}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{vendorLabel(tx)}</div>
                    {tx.vendor?.email ? (
                      <div className="text-xs text-muted-foreground">{tx.vendor.email}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{tx.category || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${TYPE_STYLE[tx.type] || "text-muted-foreground bg-muted"}`}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={tx.type === "credit" ? "text-green-600" : tx.type === "debit" ? "text-red-600" : ""}>
                    {tx.type === "debit" ? "-" : "+"}
                    {naira.format(Number(tx.amount || 0))}
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${STATUS_STYLE[tx.status] || "text-muted-foreground bg-muted"}`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{formatDate(tx.processedAt || tx.createdAt)}</TableCell>
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