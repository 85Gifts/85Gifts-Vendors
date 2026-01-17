"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Search,
  Edit,
  Trash2,
  MapPin,
  Ticket,
} from "lucide-react"
import { useToast } from "../ui/use-toast"

interface EventItem {
  id: number
  backendId?: string
  slug?: string
  title: string
  category: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  attendees: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  image: string
  description?: string
  approvalStatus?: string
  isApproved?: boolean
  approved?: boolean
  isPublished?: boolean
}

interface EventsTabProps {
  events: EventItem[]
  eventsLoading: boolean
  eventsError: string
  eventSearchTerm: string
  setEventSearchTerm: (value: string) => void
  eventFilterStatus: EventItem["status"] | "all"
  setEventFilterStatus: (value: EventItem["status"] | "all") => void
  handleDeleteEvent: (event: EventItem) => void
}

const eventStatuses: EventItem["status"][] = ["upcoming", "ongoing", "completed", "cancelled"]

const getStatusColor = (status: EventItem["status"]): string => {
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
      return "text-gray-600 bg-gray-100"
  }
}

export default function EventsTab({
  events,
  eventsLoading,
  eventsError,
  eventSearchTerm,
  setEventSearchTerm,
  eventFilterStatus,
  setEventFilterStatus,
  handleDeleteEvent,
}: EventsTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), [])
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  )

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = eventSearchTerm.toLowerCase()
      const matchesSearch =
        event.title.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      const matchesStatus = eventFilterStatus === "all" || event.status === eventFilterStatus
      return matchesSearch && matchesStatus
    })
  }, [events, eventSearchTerm, eventFilterStatus])

  const isEventApproved = (event: EventItem) => {
    if (typeof event.isApproved === "boolean") return event.isApproved
    if (typeof event.approved === "boolean") return event.approved
    if (typeof event.isPublished === "boolean") return event.isPublished
    if (event.approvalStatus) {
      const normalized = event.approvalStatus.toLowerCase()
      return normalized === "approved" || normalized === "published"
    }
    return true
  }

  const handleGenerateLink = async (event: EventItem) => {
    if (!isEventApproved(event)) {
      toast({
        title: "Event is not approved yet",
        variant: "destructive",
      })
      return
    }

    const slug = event.slug || event.backendId || String(event.id)
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const link = `${baseUrl}/event/${slug}`

    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link copied",
        description: link,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: link,
        variant: "destructive",
      })
    }
  }

  const eventStats = useMemo(() => {
    const totalEvents = events.length
    const upcomingEvents = events.filter((event) => event.status === "upcoming").length
    const registeredAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0)
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0)
    const averageFillRate =
      totalCapacity > 0 ? Math.round((registeredAttendees / totalCapacity) * 100) : 0

    return {
      totalEvents,
      upcomingEvents,
      registeredAttendees,
      averageFillRate,
    }
  }, [events])

  const eventAnalytics = useMemo(() => {
    if (events.length === 0) {
      return {
        totalRevenue: 0,
        averageTicketPrice: 0,
        averageAttendance: 0,
        capacityUtilization: 0,
        topEvent: null as EventItem | null,
        statusBreakdown: eventStatuses.map((status) => ({ status, count: 0, percentage: 0 })),
      }
    }

    const totalRevenue = events.reduce((sum, event) => sum + event.price * (event.attendees || 0), 0)
    const paidEvents = events.filter((event) => event.price > 0)
    const averageTicketPrice =
      paidEvents.length > 0
        ? Math.round(
            paidEvents.reduce((sum, event) => sum + event.price, 0) / paidEvents.length
          )
        : 0
    const averageAttendance = Math.round(
      events.reduce((sum, event) => sum + (event.attendees || 0), 0) / events.length
    )
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0)
    const capacityUtilization =
      totalCapacity > 0
        ? Math.round(
            (events.reduce((sum, event) => sum + (event.attendees || 0), 0) / totalCapacity) * 100
          )
        : 0
    const topEvent = events.reduce<EventItem | null>(
      (prev, current) => {
        if (!prev) return current
        return current.attendees > prev.attendees ? current : prev
      },
      null
    )
    const statusCounts = events.reduce<Record<EventItem["status"], number>>((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<EventItem["status"], number>)
    const statusBreakdown = eventStatuses.map((status) => {
      const count = statusCounts[status] || 0
      return {
        status,
        count,
        percentage: Math.round((count / events.length) * 100) || 0,
      }
    })

    return {
      totalRevenue,
      averageTicketPrice,
      averageAttendance,
      capacityUtilization,
      topEvent,
      statusBreakdown,
    }
  }, [events])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Event Experiences</h2>
        <button
          onClick={() => router.push("/dashboard/events/schedule")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Events",
            value: numberFormatter.format(eventStats.totalEvents),
            gradient: "from-indigo-500 to-indigo-600",
            accent: "text-indigo-100",
            iconAccent: "text-indigo-200",
            icon: Calendar,
          },
          {
            label: "Upcoming Events",
            value: numberFormatter.format(eventStats.upcomingEvents),
            gradient: "from-blue-500 to-blue-600",
            accent: "text-blue-100",
            iconAccent: "text-blue-200",
            icon: Clock,
          },
          {
            label: "Confirmed Guests",
            value: numberFormatter.format(eventStats.registeredAttendees),
            gradient: "from-pink-500 to-pink-600",
            accent: "text-pink-100",
            iconAccent: "text-pink-200",
            icon: Users,
          },
          {
            label: "Avg Fill Rate",
            value: `${eventStats.averageFillRate}%`,
            gradient: "from-emerald-500 to-emerald-600",
            accent: "text-emerald-100",
            iconAccent: "text-emerald-200",
            icon: TrendingUp,
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className={`bg-gradient-to-r ${metric.gradient} rounded-xl p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${metric.accent} text-sm`}>{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.iconAccent}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by name, location or type..."
            value={eventSearchTerm}
            onChange={(e) => setEventSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={eventFilterStatus}
          onChange={(e) => setEventFilterStatus(e.target.value as EventItem["status"] | "all")}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
        >
          <option value="all">All Statuses</option>
          {eventStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {eventsLoading ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center text-gray-500 dark:text-gray-400">
          Loading events...
        </div>
      ) : eventsError ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-red-300 dark:border-red-800 rounded-xl p-12 text-center text-red-600 dark:text-red-400">
          {eventsError}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center text-gray-500 dark:text-gray-400">
          No events match your filters. Try adjusting your search or add a new experience.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.backendId ?? `${event.id}-${event.title}-${event.date}-${event.time}`}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{event.image}</div>
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        router.push(`/dashboard/events/${event.backendId || event.id}/edit`)
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {event.date} • {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees}/{event.capacity} attending
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{event.category}</span>
                  <span className="flex items-center gap-2 text-xl font-semibold text-blue-600 dark:text-blue-400">
                    <Ticket className="w-4 h-4" />
                    {event.price > 0 ? currencyFormatter.format(event.price) : "Free RSVP"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleGenerateLink(event)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Generate Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Event Performance</h3>
          <div className="space-y-4">
            {eventAnalytics.statusBreakdown.map(({ status, count, percentage }) => {
              const [statusTextClass] = getStatusColor(status).split(" ")
              const progressColor = statusTextClass ? statusTextClass.replace("text-", "bg-") : "bg-blue-500"
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 capitalize">
                    <span>{status}</span>
                    <span>
                      {count} • {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Revenue Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Event Revenue</div>
              <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {currencyFormatter.format(eventAnalytics.totalRevenue)}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Average Ticket Price</span>
              <span>{currencyFormatter.format(eventAnalytics.averageTicketPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Average Attendance</span>
              <span>{numberFormatter.format(eventAnalytics.averageAttendance)} guests</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Capacity Utilization</span>
              <span>{eventAnalytics.capacityUtilization}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Engagement Highlights</h3>
          {eventAnalytics.topEvent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{eventAnalytics.topEvent.image}</div>
                <div>
                  <h4 className="font-semibold text-lg dark:text-white">{eventAnalytics.topEvent.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{eventAnalytics.topEvent.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.date} • {eventAnalytics.topEvent.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.attendees} guests confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Ticket className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.price > 0
                    ? `${currencyFormatter.format(eventAnalytics.topEvent.price)} tickets`
                    : "Free RSVP"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Add events to unlock engagement insights.</p>
          )}
        </div>
      </div>
    </div>
  )
}

