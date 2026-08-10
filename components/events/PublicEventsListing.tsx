"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Search, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import type { PublicEvent } from "@/app/events/page"

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled"

const eventStatuses: (EventStatus | "all")[] = [
  "all",
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]

const getStatusColor = (status: EventStatus): string => {
  switch (status) {
    case "upcoming":
      return "text-blue-600 bg-blue-100"
    case "ongoing":
      return "text-purple-600 bg-purple-100"
    case "completed":
      return "text-green-600 bg-green-100"
    case "cancelled":
      return "text-red-600 bg-red-100"
    default:
      return "text-muted-foreground bg-muted"
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(date)
  } catch {
    return ""
  }
}

const formatTime = (iso?: string) => {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("en-NG", {
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date)
  } catch {
    return ""
  }
}

export default function PublicEventsListing({
  events,
}: {
  events: PublicEvent[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all")

  const nairaFormatter = useMemo(
    () => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
    []
  )

  const enriched = useMemo(
    () =>
      events.map((event) => {
        const startAt = event.startAt
        const endAt = event.endAt
        let status: EventStatus = "upcoming"
        if (startAt) {
          const now = new Date()
          const start = new Date(startAt)
          const end = endAt ? new Date(endAt) : undefined
          if (end && now > end) status = "completed"
          else if (now >= start && (!end || now <= end)) status = "ongoing"
        }
        const tiers = Array.isArray(event.tiers) ? event.tiers : []
        const minPrice = tiers.length
          ? Math.min(...tiers.map((t) => Number(t.price || 0)))
          : 0
        const locationText = [
          event.location?.venue ?? event.location?.venueName,
          event.location?.address,
          [event.location?.city, event.location?.state].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" • ")
        return { event, status, minPrice, locationText }
      }),
    [events]
  )

  const filteredEvents = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return enriched.filter(({ event, status }) => {
      const matchesSearch =
        event.name.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.organiserName?.toLowerCase().includes(search)
      const matchesStatus = filterStatus === "all" || status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [enriched, searchTerm, filterStatus])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
            Discover experiences, book tickets, and never miss out on what&apos;s
            happening on 85Gifts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search events by name, organiser or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | "all")}
            className="px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent capitalize"
          >
            {eventStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
            No events found. Check back soon for new experiences.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map(({ event, status, minPrice, locationText }) => (
              <Link
                key={event.slug}
                href={`/event/${event.slug}`}
                className="bg-card rounded-xl shadow-sm border dark:border-border hover:shadow-md transition-shadow group"
              >
                <div className="relative h-40 rounded-t-xl overflow-hidden bg-muted">
                  {event.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.coverImageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🎉
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 right-3 capitalize ${getStatusColor(status)}`}
                  >
                    {status}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="font-semibold text-lg dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.name}
                    </h2>
                    {event.organiserName && (
                      <p className="text-sm text-muted-foreground">
                        Hosted by {event.organiserName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(event.startAt) || "Date TBA"}
                      {formatTime(event.startAt) ? ` • ${formatTime(event.startAt)}` : ""}
                    </span>
                  </div>

                  {locationText && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{locationText}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <Ticket className="w-4 h-4" />
                      {minPrice > 0 ? nairaFormatter.format(minPrice) : "Free RSVP"}
                    </span>
                    <Button size="sm" asChild>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        View Event
                      </span>
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  )
}
