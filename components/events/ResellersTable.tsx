"use client"

import { useEffect, useState } from "react"
import { Copy, Check, ChevronLeft, ChevronRight, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

export interface Reseller {
  _id: string
  eventId: string
  vendorId: string
  email: string
  name: string
  referralCode: string
  status: string
  resellerLink: string
  createdAt: string
  updatedAt: string
}

interface ResellersPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ResellersTableProps {
  eventId: string
  refreshKey?: number
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
    case "active":
      return "bg-green-100 text-green-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "inactive":
      return "bg-gray-100 text-gray-600"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export default function ResellersTable({ eventId, refreshKey = 0 }: ResellersTableProps) {
  const { toast } = useToast()
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<ResellersPagination | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [refreshKey])

  useEffect(() => {
    if (!eventId) return
    let isMounted = true

    async function loadResellers() {
      try {
        setLoading(true)
        setError("")
        const params = new URLSearchParams({ page: String(page), limit: "20" })
        const res = await fetch(`/api/events/${eventId}/resellers?${params}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || json.error || "Failed to load resellers")

        const data = json?.data ?? json
        if (isMounted) {
          setResellers(data.resellers ?? [])
          setPagination(data.pagination ?? null)
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load resellers")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadResellers()
    return () => { isMounted = false }
  }, [eventId, page, refreshKey])

  const copyLink = async (reseller: Reseller) => {
    try {
      await navigator.clipboard.writeText(reseller.resellerLink)
      setCopiedId(reseller._id)
      toast({ title: "Link copied", description: reseller.resellerLink, variant: "success" })
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast({ title: "Copy failed", variant: "destructive" })
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Resellers</h2>
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
      ) : resellers.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400">No resellers yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resellers.map((reseller) => (
                <TableRow key={reseller._id}>
                  <TableCell className="font-medium text-gray-900">{reseller.name}</TableCell>
                  <TableCell className="text-gray-600">{reseller.email}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-gray-700">{reseller.referralCode}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${getStatusStyle(reseller.status)}`}
                    >
                      {reseller.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(reseller.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => copyLink(reseller)}
                      title="Copy reseller link"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                      {copiedId === reseller._id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
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
    </div>
  )
}
