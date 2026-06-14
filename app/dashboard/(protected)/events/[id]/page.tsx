"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  TrendingUp,
  Tag,
  User,
  Edit,
  CheckCircle2,
  Circle,
  BarChart3,
  UserPlus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AddResellerModal from "@/components/events/AddResellerModal"
import ResellersTable from "@/components/events/ResellersTable"
import ResellerRequestsTable from "@/components/events/ResellerRequestsTable"

type Tier = {
  _id: string
  name: string
  price: number
  capacity: number
  sold: number
}

type EventDetail = {
  _id: string
  name: string
  slug: string
  description: string
  organiserName: string
  startAt: string
  endAt: string
  salesPeriod: { start: string; end: string }
  location: { address: string; city: string; state: string; country: string }
  tiers: Tier[]
  status: string
  isPublished: boolean
  coverImageUrl: string
  category: string
  tags: string[]
  totalCapacity: number
  totalSold: number
  remaining: number
  submissionDate: string
  publishedDate: string
  createdAt: string
  updatedAt: string
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

const formatDateTime = (iso?: string) => {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(iso))
  } catch {
    return "—"
  }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount)

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "published":
      return "bg-green-100 text-green-700 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "draft":
      return "bg-gray-100 text-gray-600 border-gray-200"
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-blue-100 text-blue-700 border-blue-200"
  }
}

export default function EventDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const eventId = (params?.id as string) || ""

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [resellerOpen, setResellerOpen] = useState(false)
  const [resellersRefreshKey, setResellersRefreshKey] = useState(0)
  const [requestsRefreshKey, setRequestsRefreshKey] = useState(0)

  useEffect(() => {
    if (!eventId) return
    let isMounted = true

    async function loadEvent() {
      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/events/${eventId}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || json.error || "Failed to load event")
        const data: EventDetail = json?.data?.data || json?.data || json
        if (isMounted) setEvent(data)
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load event")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEvent()
    return () => { isMounted = false }
  }, [eventId])

  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Invalid event ID.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
          <p className="text-sm text-gray-500">Loading event…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!event) return null

  const locationParts = [event.location?.address, event.location?.city, event.location?.state, event.location?.country].filter(Boolean)
  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "No location specified"

  const soldPercent = event.totalCapacity > 0 ? Math.round((event.totalSold / event.totalCapacity) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        {event.coverImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverImageUrl})` }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600" />
        )}

        {/* Back + Edit controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 md:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Button
            onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
            variant="outline"
            size="sm"
            className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-6 md:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getStatusStyle(event.status)}`}>
              {event.isPublished ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Circle className="mr-1 h-3 w-3" />}
              {event.status}
            </span>
            {event.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white capitalize backdrop-blur-sm">
                <Tag className="h-3 w-3" />
                {event.category}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow md:text-3xl">{event.name}</h1>
          {event.organiserName && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
              <User className="h-3.5 w-3.5" />
              Hosted by {event.organiserName}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: main info */}
          <div className="space-y-6 lg:col-span-2">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{event.totalSold}</p>
                <p className="mt-0.5 text-xs text-gray-500">Tickets Sold</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{event.remaining}</p>
                <p className="mt-0.5 text-xs text-gray-500">Remaining</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{event.totalCapacity}</p>
                <p className="mt-0.5 text-xs text-gray-500">Total Capacity</p>
              </div>
            </div>

            {/* Sales progress */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  Sales Progress
                </span>
                <span className="text-sm font-bold text-gray-900">{soldPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-900 transition-all"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">{event.totalSold} of {event.totalCapacity} tickets sold</p>
            </div>

            {/* Description */}
            {event.description && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">About this Event</h2>
                <p className="text-sm leading-relaxed text-gray-600">{event.description}</p>
              </div>
            )}

            {/* Date & Time */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Date & Time</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Start</p>
                    <p className="text-sm font-medium text-gray-800">{formatDateTime(event.startAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">End</p>
                    <p className="text-sm font-medium text-gray-800">{formatDateTime(event.endAt)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Sales Window</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(event.salesPeriod?.start)} — {formatDate(event.salesPeriod?.end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Location</h2>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <p className="text-sm text-gray-700">{locationText}</p>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: ticket tiers + meta */}
          <div className="space-y-6">

            {/* Ticket Tiers */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Ticket className="h-4 w-4 text-gray-400" />
                Ticket Tiers
              </h2>
              {event.tiers && event.tiers.length > 0 ? (
                <div className="space-y-3">
                  {event.tiers.map((tier) => {
                    const tierPercent = tier.capacity > 0 ? Math.round((tier.sold / tier.capacity) * 100) : 0
                    return (
                      <div key={tier._id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800">{tier.name}</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(tier.price)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tier.sold}/{tier.capacity} sold
                          </span>
                          <span>{tierPercent}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gray-700"
                            style={{ width: `${tierPercent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tiers defined.</p>
              )}
            </div>

            {/* Meta info */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Published</dt>
                  <dd className="font-medium text-gray-800">{formatDate(event.publishedDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Submitted</dt>
                  <dd className="font-medium text-gray-800">{formatDate(event.submissionDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Created</dt>
                  <dd className="font-medium text-gray-800">{formatDate(event.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Last Updated</dt>
                  <dd className="font-medium text-gray-800">{formatDate(event.updatedAt)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt className="text-gray-400">Slug</dt>
                  <dd className="font-mono text-xs text-gray-600">{event.slug}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Event ID</dt>
                  <dd className="font-mono text-xs text-gray-600 truncate max-w-[120px]" title={event._id}>{event._id}</dd>
                </div>
              </dl>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
                className="w-full gap-2 bg-gray-900 text-white hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                Edit Event
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
              <Button
                variant="outline"
                onClick={() => setResellerOpen(true)}
                className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                <UserPlus className="h-4 w-4" />
                Add Reseller
              </Button>
            </div>
          </div>
        </div>

        {/* Resellers */}
        <div className="mt-6 space-y-6">
          <ResellersTable eventId={eventId} refreshKey={resellersRefreshKey} />
          <ResellerRequestsTable
            eventId={eventId}
            refreshKey={requestsRefreshKey}
            onApproved={() => {
              setRequestsRefreshKey((k) => k + 1)
              setResellersRefreshKey((k) => k + 1)
            }}
            onRejected={() => setRequestsRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      {/* Add Reseller Modal */}
      <AddResellerModal
        isOpen={resellerOpen}
        onClose={() => setResellerOpen(false)}
        eventId={eventId}
        eventName={event.name}
        onSuccess={() => setResellersRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
