"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Trash2,
  Mail,
  CalendarDays,
  MapPin,
  Users,
  Ticket,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import { AdminEvent } from "@/app/types/admin"

const STATUS_STYLES: Record<string, string> = {
  draft: "text-muted-foreground bg-muted",
  pending_review: "text-amber-600 bg-amber-100",
  published: "text-green-600 bg-green-100",
  rejected: "text-red-600 bg-red-100",
  cancelled: "text-red-600 bg-red-100",
  ended: "text-blue-600 bg-blue-100",
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

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

export default function AdminEventDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId

  const [event, setEvent] = useState<AdminEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showNotify, setShowNotify] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const fetchEvent = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setError("")
    try {
      const data = await adminApi.getEvent(eventId)
      setEvent(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load event")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const handlePublish = async () => {
    if (!event) return
    setPublishing(true)
    try {
      await adminApi.publishEvent(event._id)
      toast({ title: "Event published", description: `${event.name} is now live.`, variant: "success" })
      fetchEvent()
    } catch (err: any) {
      toast({ title: "Publish failed", description: err?.message, variant: "destructive" })
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    setDeleting(true)
    try {
      await adminApi.deleteEvent(event._id)
      toast({ title: "Event deleted", description: `${event.name} was removed.`, variant: "success" })
      router.push("/admin/events")
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleNotify = async () => {
    if (!event) return
    if (!message.trim()) {
      toast({ title: "Message required", description: "Please provide an email body.", variant: "destructive" })
      return
    }
    setNotifying(true)
    try {
      await adminApi.notifyBookings(event._id, {
        message: message.trim(),
        subject: subject.trim() || undefined,
      })
      toast({ title: "Notifications sent", description: "Customers with bookings have been emailed.", variant: "success" })
      setShowNotify(false)
      setSubject("")
      setMessage("")
    } catch (err: any) {
      toast({ title: "Notification failed", description: err?.message, variant: "destructive" })
    } finally {
      setNotifying(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
        {error || "Event not found"}
      </div>
    )
  }

  const vendor = event.vendor
  const tiers = Array.isArray(event.tiers) ? event.tiers : []
  const minPrice = tiers.length ? Math.min(...tiers.map((t) => Number(t.price || 0))) : 0
  const location =
    event.location?.venue ||
    event.location?.address ||
    [event.location?.city, event.location?.state].filter(Boolean).join(", ") ||
    "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/events")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to events
        </Button>
        <div className="flex items-center gap-2">
          {event.status === "pending_review" && (
            <Button onClick={handlePublish} disabled={publishing}>
              <Send className="h-4 w-4 mr-2" />
              {publishing ? "Publishing..." : "Publish Event"}
            </Button>
          )}
          {event.status === "published" && (
            <Button variant="secondary" onClick={() => setShowNotify(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Email Booking Customers
            </Button>
          )}
          <Button variant="outline" className="text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <Badge className={`capitalize ${STATUS_STYLES[event.status || ""] || "text-muted-foreground bg-muted"}`}>
              {(event.status || "unknown").replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{event.description || "No description"}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> {formatDate(event.startAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" /> {vendor?.businessName || vendor?.name || event.vendorId || "Unknown"}
            </span>
          </div>
        </div>
        {event.emoji || event.image ? (
          <div className="hidden sm:block text-6xl leading-none">{event.emoji || "🎉"}</div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold capitalize">{event.category || "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ticket From</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{tiers.length ? naira.format(minPrice) : "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Capacity / Sold</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-lg font-semibold">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            {Number(event.totalSold ?? 0).toLocaleString()} / {Number(event.totalCapacity ?? 0).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {tiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ticket Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier, i) => (
                <div key={i} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium capitalize">{tier.name || `Tier ${i + 1}`}</div>
                  <div className="mt-1 text-muted-foreground">
                    {naira.format(Number(tier.price || 0))} · {Number(tier.capacity ?? 0)} capacity
                    {tier.sold ? ` · ${tier.sold} sold` : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.rejectionReason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <strong>Rejection reason:</strong> {event.rejectionReason}
        </div>
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{event.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNotify} onOpenChange={setShowNotify}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email booking customers</DialogTitle>
            <DialogDescription>
              Send an update to all customers with bookings for this event. HTML is supported in the body.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notify-subject">Subject (optional)</Label>
              <Input id="notify-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Update on your booking" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notify-message">Message body</Label>
              <textarea
                id="notify-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="<p>Your HTML message body</p>"
                rows={8}
                maxLength={20000}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-auto w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotify(false)} disabled={notifying}>
              Cancel
            </Button>
            <Button onClick={handleNotify} disabled={notifying}>
              <Mail className="h-4 w-4 mr-2" />
              {notifying ? "Sending..." : "Send emails"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}