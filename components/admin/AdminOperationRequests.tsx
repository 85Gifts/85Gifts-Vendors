"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  OperationRequestReviewDialog,
  type OperationRequestReviewMode,
} from "@/components/admin/OperationRequestReviewDialog"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import { formatDateTime, formatRelativeTime } from "@/lib/formatTime"
import type {
  OperationRequest,
  OperationRequestStatus,
} from "@/app/types/operationRequest"

const PAGE_SIZE = 20

type StatusFilter = OperationRequestStatus | "all"
type TypeFilter = "all" | "storefront_publish"

const TYPE_LABELS: Record<string, string> = {
  storefront_publish: "Storefront publish",
}

const STATUS_STYLES: Record<OperationRequestStatus, string> = {
  pending: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950",
  approved:
    "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950",
  rejected: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950",
  cancelled: "text-muted-foreground bg-muted",
}

const STATUS_LABELS: Record<OperationRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

function requestName(request: OperationRequest): string {
  const name = (request.payload as Record<string, unknown> | undefined)?.name
  return typeof name === "string" && name ? name : "Untitled request"
}

function requestSlug(request: OperationRequest): string {
  const slug = (request.payload as Record<string, unknown> | undefined)?.slug
  return typeof slug === "string" && slug ? slug : "—"
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status as OperationRequestStatus] ?? status
}

function statusStyle(status: string): string {
  return (
    STATUS_STYLES[status as OperationRequestStatus] ??
    "text-muted-foreground bg-muted"
  )
}

export default function AdminOperationRequests() {
  const { toast } = useToast()

  const [requests, setRequests] = useState<OperationRequest[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selected, setSelected] = useState<OperationRequest | null>(null)
  const [mode, setMode] = useState<OperationRequestReviewMode>("view")

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.listOperationRequests({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
      })
      setRequests(result.items)
      setPagination(result.pagination)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load operation requests."
      )
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const changeStatus = (value: string) => {
    setPage(1)
    setStatusFilter(value as StatusFilter)
  }

  const changeType = (value: string) => {
    setPage(1)
    setTypeFilter(value as TypeFilter)
  }

  const openReview = (
    request: OperationRequest,
    nextMode: OperationRequestReviewMode
  ) => {
    setSelected(request)
    setMode(nextMode)
  }

  const handleReviewed = () => {
    if (requests.length === 1 && page > 1) {
      setPage((current) => current - 1)
    } else {
      fetchRequests()
    }
  }

  const copyVendorId = async (vendorId: string) => {
    try {
      await navigator.clipboard.writeText(vendorId)
      toast({ title: "Vendor ID copied" })
    } catch {
      toast({
        title: "Could not copy",
        description: vendorId,
        variant: "destructive",
      })
    }
  }

  const renderActions = (request: OperationRequest, withLabels: boolean) => (
    <div
      className={
        withLabels
          ? "flex flex-wrap items-center justify-end gap-1.5"
          : "flex items-center justify-end gap-1"
      }
    >
      <Button
        size={withLabels ? "sm" : "icon"}
        variant={withLabels ? "outline" : "ghost"}
        className={withLabels ? "px-2 text-xs" : undefined}
        title="View request"
        onClick={() => openReview(request, "view")}
      >
        <Eye className={withLabels ? "size-3.5" : "size-4"} />
        {withLabels && "View"}
      </Button>
      {request.status === "pending" && (
        <>
          <Button
            size={withLabels ? "sm" : "icon"}
            variant={withLabels ? "outline" : "ghost"}
            className={`${withLabels ? "px-2 text-xs " : ""}text-green-600 hover:text-green-700 dark:text-green-400`}
            title="Approve and publish"
            onClick={() => openReview(request, "approve")}
          >
            <CheckCircle2 className={withLabels ? "size-3.5" : "size-4"} />
            {withLabels && "Approve"}
          </Button>
          <Button
            size={withLabels ? "sm" : "icon"}
            variant={withLabels ? "outline" : "ghost"}
            className={`${withLabels ? "px-2 text-xs " : ""}text-destructive hover:text-destructive`}
            title="Reject request"
            onClick={() => openReview(request, "reject")}
          >
            <XCircle className={withLabels ? "size-3.5" : "size-4"} />
            {withLabels && "Reject"}
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">
            Operation requests
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review storefront publishing requests. Approving publishes the
            storefront immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={changeType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Request type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All request types</SelectItem>
              <SelectItem value="storefront_publish">
                Storefront publish
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Refresh requests"
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={changeStatus}>
        <TabsList className="grid h-auto min-h-9 w-full grid-cols-5 items-stretch justify-start self-start group-data-[orientation=horizontal]/tabs:h-auto sm:inline-flex sm:w-fit sm:max-w-full sm:flex-wrap">
          <TabsTrigger
            value="pending"
            className="min-w-0 px-0 text-xs tracking-tight sm:flex-none sm:px-2 sm:text-sm sm:tracking-normal"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="min-w-0 px-0 text-xs tracking-tight sm:flex-none sm:px-2 sm:text-sm sm:tracking-normal"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="min-w-0 px-0 text-xs tracking-tight sm:flex-none sm:px-2 sm:text-sm sm:tracking-normal"
          >
            Rejected
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="min-w-0 px-0 text-xs tracking-tight sm:flex-none sm:px-2 sm:text-sm sm:tracking-normal"
          >
            Cancelled
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="min-w-0 px-0 text-xs tracking-tight sm:flex-none sm:px-2 sm:text-sm sm:tracking-normal"
          >
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 xl:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-lg" />
          ))
        ) : requests.length === 0 ? (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            {statusFilter === "pending"
              ? "No pending requests. You are all caught up."
              : "No operation requests match these filters."}
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary">
                    {TYPE_LABELS[request.type] ?? request.type}
                  </Badge>
                  <p className="mt-2 truncate font-medium">
                    {requestName(request)}
                  </p>
                  <code className="block truncate text-xs text-muted-foreground">
                    {requestSlug(request)}
                  </code>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 border-transparent ${statusStyle(request.status)}`}
                >
                  {statusLabel(request.status)}
                </Badge>
              </div>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p title={formatDateTime(request.createdAt)}>
                  Submitted {formatRelativeTime(request.createdAt)}
                </p>
                <button
                  type="button"
                  className="block max-w-full truncate font-mono text-left hover:text-foreground"
                  title={`Copy ${request.requesterId}`}
                  onClick={() => copyVendorId(request.requesterId)}
                >
                  {request.requesterId || "—"}
                </button>
              </div>

              {request.reviewNote && (
                <p
                  className="mt-2 line-clamp-2 text-sm text-muted-foreground"
                  title={request.reviewNote}
                >
                  <span className="font-medium">Review note:</span>{" "}
                  {request.reviewNote}
                </p>
              )}

              <div className="mt-3 border-t pt-3">
                {renderActions(request, true)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden rounded-lg border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="hidden lg:table-cell">Vendor ID</TableHead>
              <TableHead className="hidden md:table-cell">Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Review Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {statusFilter === "pending"
                    ? "No pending requests. You are all caught up."
                    : "No operation requests match these filters."}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {TYPE_LABELS[request.type] ?? request.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[16rem]">
                    <p className="truncate font-medium">
                      {requestName(request)}
                    </p>
                    <code className="truncate text-xs text-muted-foreground">
                      {requestSlug(request)}
                    </code>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <button
                      type="button"
                      className="max-w-[10rem] truncate font-mono text-xs text-muted-foreground hover:text-foreground"
                      title={`Copy ${request.requesterId}`}
                      onClick={() => copyVendorId(request.requesterId)}
                    >
                      {request.requesterId || "—"}
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className="text-sm"
                      title={formatDateTime(request.createdAt)}
                    >
                      {formatRelativeTime(request.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-transparent ${statusStyle(request.status)}`}
                    >
                      {statusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[14rem] xl:table-cell">
                    <span
                      className="line-clamp-1 text-sm text-muted-foreground"
                      title={request.reviewNote || undefined}
                    >
                      {request.reviewNote || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActions(request, false)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
            {pagination.total === 1 ? "request" : "requests"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next page"
              disabled={page >= pagination.pages}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.pages, current + 1)
                )
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {selected && (
        <OperationRequestReviewDialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
          request={selected}
          mode={mode}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  )
}
