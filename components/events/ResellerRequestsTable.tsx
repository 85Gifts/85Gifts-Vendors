"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ClipboardList, Check, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

export interface ResellerRequest {
  _id: string
  eventId: string
  vendorId: string
  email: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

interface RequestsPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ResellerRequestsTableProps {
  eventId: string
  refreshKey?: number
  onApproved?: () => void
  onRejected?: () => void
}

const formatDate = (iso?: string) => {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(iso))
  } catch {
    return "—"
  }
}

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "approved":
      return "bg-green-100 text-green-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

const getApiErrorMessage = (payload: any, fallback: string): string => {
  const msg = payload?.message
  if (typeof msg === "string") return msg
  if (typeof msg?.message === "string") return msg.message
  if (typeof payload?.error === "string") return payload.error
  if (typeof payload?.error?.message === "string") return payload.error.message
  return fallback
}

export default function ResellerRequestsTable({
  eventId,
  refreshKey = 0,
  onApproved,
  onRejected,
}: ResellerRequestsTableProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<ResellerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<RequestsPagination | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<ResellerRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [refreshKey])

  useEffect(() => {
    if (!eventId) return
    let isMounted = true

    async function loadRequests() {
      try {
        setLoading(true)
        setError("")
        const params = new URLSearchParams({ page: String(page), limit: "20" })
        const res = await fetch(`/api/events/${eventId}/reseller-requests?${params}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.message || json.error || "Failed to load reseller requests")
        }

        const data = json?.data ?? json
        if (isMounted) {
          setRequests(data.requests ?? [])
          setPagination(data.pagination ?? null)
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load reseller requests")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRequests()
    return () => { isMounted = false }
  }, [eventId, page, refreshKey])

  const handleApprove = async (request: ResellerRequest) => {
    setActionId(request._id)
    try {
      const res = await fetch(
        `/api/events/${eventId}/reseller-requests/${request._id}/approve`,
        { method: "POST", credentials: "include" }
      )
      const json = await res.json()
      if (!res.ok) {
        throw new Error(getApiErrorMessage(json, "Failed to approve request"))
      }

      const reseller = json?.data?.reseller ?? json?.data?.data?.reseller
      const resellerLink = reseller?.resellerLink

      toast({
        title: "Request approved",
        description: resellerLink
          ? `Reseller created. Link: ${resellerLink}`
          : `${request.name} is now a reseller.`,
        variant: "success",
      })

      onApproved?.()
    } catch (err: any) {
      toast({
        title: "Approval failed",
        description: err?.message || "Could not approve request.",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const openRejectModal = (request: ResellerRequest) => {
    setRejectingRequest(request)
    setRejectReason("")
  }

  const closeRejectModal = () => {
    if (!rejectSubmitting) {
      setRejectingRequest(null)
      setRejectReason("")
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectingRequest) return
    setRejectSubmitting(true)
    setActionId(rejectingRequest._id)
    try {
      const payload: { reason?: string } = {}
      if (rejectReason.trim()) payload.reason = rejectReason.trim()

      const res = await fetch(
        `/api/events/${eventId}/reseller-requests/${rejectingRequest._id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        throw new Error(getApiErrorMessage(json, "Failed to reject request"))
      }

      toast({
        title: "Request rejected",
        description: `${rejectingRequest.name}'s application was rejected.`,
        variant: "success",
      })

      setRejectingRequest(null)
      setRejectReason("")
      onRejected?.()
    } catch (err: any) {
      toast({
        title: "Rejection failed",
        description: err?.message || "Could not reject request.",
        variant: "destructive",
      })
    } finally {
      setRejectSubmitting(false)
      setActionId(null)
    }
  }

  const isPending = (status: string) => status.toLowerCase() === "pending"

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Reseller Requests</h2>
          {pagination && (
            <span className="text-xs text-gray-400">({pagination.total})</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
        </div>
      ) : error ? (
        <p className="px-5 py-8 text-center text-sm text-red-600">{error}</p>
      ) : requests.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400">No reseller requests yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium text-gray-900">{request.name}</TableCell>
                  <TableCell className="text-gray-600">{request.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${getStatusStyle(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {isPending(request.status) ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === request._id}
                          onClick={() => handleApprove(request)}
                          className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === request._id}
                          onClick={() => openRejectModal(request)}
                          className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.pages}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeRejectModal}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Reject Request</h2>
              <button
                onClick={closeRejectModal}
                disabled={rejectSubmitting}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-gray-500">
                Reject <span className="font-medium text-gray-700">{rejectingRequest.name}</span>
                &apos;s reseller application?
              </p>
              <div className="space-y-1.5">
                <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
                  Reason <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Does not meet requirements"
                  disabled={rejectSubmitting}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeRejectModal}
                  disabled={rejectSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={rejectSubmitting}
                  className="flex-1 gap-2 border-red-200 bg-red-600 text-white hover:bg-red-700"
                >
                  {rejectSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rejecting…
                    </>
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
