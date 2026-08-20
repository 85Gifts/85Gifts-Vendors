"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Send, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import { AdminEvent, AdminEventStatus } from "@/app/types/admin"

const STATUS_FILTERS: Array<AdminEventStatus | "all"> = [
  "all",
  "draft",
  "pending_review",
  "published",
  "rejected",
  "cancelled",
  "ended",
]

const STATUS_STYLES: Record<string, string> = {
  draft: "text-muted-foreground bg-muted",
  pending_review: "text-amber-600 bg-amber-100",
  published: "text-green-600 bg-green-100",
  rejected: "text-red-600 bg-red-100",
  cancelled: "text-red-600 bg-red-100",
  ended: "text-blue-600 bg-blue-100",
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

function vendorName(event: AdminEvent): string {
  const v = event.vendor
  return v?.businessName || v?.name || event.vendorId || "Unknown"
}

export default function AdminEvents() {
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<AdminEvent[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [draftSearch, setDraftSearch] = useState("")
  const [draftCategory, setDraftCategory] = useState("")
  const [query, setQuery] = useState({
    page: 1,
    status: "all" as AdminEventStatus | "all",
    category: "",
    search: "",
  })

  const [toDelete, setToDelete] = useState<AdminEvent | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.listEvents({
        page: query.page,
        limit: pagination.limit,
        status: query.status === "all" ? undefined : query.status,
        category: query.category || undefined,
        search: query.search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      setItems(result.items)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err?.message || "Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [query, pagination.limit])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const applyFilters = () => {
    setQuery((q) => ({
      page: 1,
      status: q.status,
      category: draftCategory.trim(),
      search: draftSearch.trim(),
    }))
  }

  const changeStatus = (value: string) => {
    setQuery((q) => ({ ...q, status: value as AdminEventStatus | "all", page: 1 }))
  }

  const handlePublish = async (event: AdminEvent) => {
    setPublishingId(event._id)
    try {
      await adminApi.publishEvent(event._id)
      toast({ title: "Event published", description: `${event.name} is now live.`, variant: "success" })
      fetchEvents()
    } catch (err: any) {
      toast({ title: "Publish failed", description: err?.message, variant: "destructive" })
    } finally {
      setPublishingId(null)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.deleteEvent(toDelete._id)
      toast({ title: "Event deleted", description: `${toDelete.name} was removed.`, variant: "success" })
      setToDelete(null)
      fetchEvents()
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search name, description, organiser"
              className="pl-9"
            />
          </div>
          <Select value={query.status} onValueChange={changeStatus}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Category"
            className="w-full sm:w-40"
          />
          <Button onClick={applyFilters} variant="secondary">
            Apply
          </Button>
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
              <TableHead>Event</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              items.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{vendorName(event)}</TableCell>
                  <TableCell className="capitalize">{event.category || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(event.startAt)}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${STATUS_STYLES[event.status || ""] || "text-muted-foreground bg-muted"}`}>
                      {(event.status || "unknown").replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" title="View details" onClick={() => router.push(`/admin/events/${event._id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {event.status === "pending_review" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600"
                          title="Publish event"
                          disabled={publishingId === event._id}
                          onClick={() => handlePublish(event)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-destructive" title="Delete event" onClick={() => setToDelete(event)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} · {pagination.total} events
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

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{toDelete?.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} variant="destructive">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}