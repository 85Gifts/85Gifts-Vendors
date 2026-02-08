"use client"

import { useMemo, useState, useRef, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MoreHorizontal,
  MessageSquare,
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

interface Booking {
  bookingReference: string
  eventId: string
  eventSlug: string
  eventName: string
  customer: {
    name: string
    email: string
    phone: string
  }
  tickets: Array<{
    tierName: string
    quantity: number
    pricePerTicket: number
    totalPrice: number
    _id: string
  }>
  subtotal: number
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

interface BookingsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface BookingsResponse {
  success: boolean
  data: {
    message: string
    data: {
      totalBookings: number
      totalRevenue: number
      statusCounts: {
        paid: number
        pending: number
      }
      bookings: Booking[]
      pagination?: BookingsPagination
    }
  }
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
  const nairaFormatter = useMemo(
    () => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
    []
  )
  
  // Carousel state for mobile
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState("")
  const [bookingsStats, setBookingsStats] = useState<{
    totalBookings: number
    totalRevenue: number
    statusCounts: { paid: number; pending: number }
  } | null>(null)
  const [bookingsPagination, setBookingsPagination] = useState<BookingsPagination | null>(null)
  const [bookingsEventId, setBookingsEventId] = useState("")
  const [bookingsSearch, setBookingsSearch] = useState("")
  const [bookingsPage, setBookingsPage] = useState(1)
  const BOOKINGS_PAGE_SIZE = 10
  const [reminderModalBooking, setReminderModalBooking] = useState<Booking | null>(null)
  const [reminderSending, setReminderSending] = useState(false)

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

  const statsCards = useMemo(() => [
    {
      id: 'total-events',
      label: "Total Events",
      value: numberFormatter.format(eventStats.totalEvents),
      gradient: "from-indigo-500 to-indigo-600",
      accent: "text-indigo-100",
      iconAccent: "text-indigo-200",
      icon: Calendar,
      hasButton: true,
    },
    {
      id: 'upcoming-events',
      label: "Upcoming Events",
      value: numberFormatter.format(eventStats.upcomingEvents),
      gradient: "from-blue-500 to-blue-600",
      accent: "text-blue-100",
      iconAccent: "text-blue-200",
      icon: Clock,
    },
    {
      id: 'confirmed-guests',
      label: "Confirmed Guests",
      value: numberFormatter.format(eventStats.registeredAttendees),
      gradient: "from-pink-500 to-pink-600",
      accent: "text-pink-100",
      iconAccent: "text-pink-200",
      icon: Users,
    },
    {
      id: 'avg-fill-rate',
      label: "Avg Fill Rate",
      value: `${eventStats.averageFillRate}%`,
      gradient: "from-emerald-500 to-emerald-600",
      accent: "text-emerald-100",
      iconAccent: "text-emerald-200",
      icon: TrendingUp,
    },
  ], [eventStats, numberFormatter])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50
    
    if (distance > minSwipeDistance && currentSlide < statsCards.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else if (distance < -minSwipeDistance && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }
  
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentSlide * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
  }, [currentSlide, statsCards.length])
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  
  const nextSlide = () => {
    if (currentSlide < statsCards.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setBookingsPage(1)
  }, [bookingsEventId, bookingsSearch])

  // Fetch bookings (with eventId, search, page, limit)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true)
        setBookingsError("")
        const params = new URLSearchParams()
        if (bookingsEventId) params.set("eventId", bookingsEventId)
        if (bookingsSearch.trim()) params.set("search", bookingsSearch.trim())
        params.set("page", String(bookingsPage))
        params.set("limit", String(BOOKINGS_PAGE_SIZE))
        const url = `/api/vendor/bookings?${params.toString()}`

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        const data: BookingsResponse = await response.json()

        if (!response.ok) {
          throw new Error(data?.data?.message || "Failed to fetch bookings")
        }

        if (data.success && data.data?.data) {
          const d = data.data.data
          setBookings(d.bookings || [])
          setBookingsStats({
            totalBookings: d.totalBookings ?? 0,
            totalRevenue: d.totalRevenue ?? 0,
            statusCounts: d.statusCounts ?? { paid: 0, pending: 0 },
          })
          if (d.pagination) setBookingsPagination(d.pagination)
          else setBookingsPagination(null)
        }
      } catch (error: any) {
        console.error("Error fetching bookings:", error)
        setBookingsError(error.message || "Failed to load bookings")
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [bookingsEventId, bookingsSearch, bookingsPage])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Desktop / Carousel - Mobile */}
      <div className="relative">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.id}
                className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white`}
              >
                <div className={`flex items-center justify-between ${card.hasButton ? 'mb-4' : ''}`}>
                  <div>
                    <p className={`${card.accent} text-sm`}>{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${card.iconAccent}`} />
                </div>
                {card.hasButton && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push("/dashboard/events/schedule")}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule Event
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative -mx-6 px-6">
          <div
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {statsCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="min-w-full snap-center"
                >
                  <div className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white h-full min-h-[160px] flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className={`${card.accent} text-sm`}>{card.label}</p>
                        <p className="text-3xl font-bold">{card.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${card.iconAccent}`} />
                    </div>
                    <div className="flex gap-2 h-[32px]">
                      {card.hasButton ? (
                        <button 
                          onClick={() => router.push("/dashboard/events/schedule")}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Schedule Event
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows */}
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentSlide < statsCards.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {statsCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
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
                    {event.price > 0 ? nairaFormatter.format(event.price) : "Free RSVP"}
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

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">Recent Bookings</h3>
              {bookingsStats && (
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {numberFormatter.format(bookingsStats.totalBookings)}</span>
                  <span title="This page only">This page — Revenue: {nairaFormatter.format(bookingsStats.totalRevenue)}</span>
                  <span className="text-green-600 dark:text-green-400" title="This page only">
                    Paid: {numberFormatter.format(bookingsStats.statusCounts.paid)}
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400" title="This page only">
                    Pending: {numberFormatter.format(bookingsStats.statusCounts.pending)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-0">
              <select
                value={bookingsEventId}
                onChange={(e) => setBookingsEventId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by event"
              >
                <option value="">All events</option>
                {events.map((event, index) => {
                  const id = event.backendId || String(event.id)
                  return (
                    <option key={`${id}-${index}`} value={id}>
                      {event.title}
                    </option>
                  )
                })}
              </select>
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
                <input
                  type="search"
                  placeholder="Search by name, email, ref..."
                  value={bookingsSearch}
                  onChange={(e) => setBookingsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search bookings"
                />
              </div>
            </div>
          </div>
        </div>

        {bookingsLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Loading bookings...
          </div>
        ) : bookingsError ? (
          <div className="p-12 text-center text-red-600 dark:text-red-400">
            {bookingsError}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booking Ref
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {bookings.map((booking) => (
                  <tr key={booking.bookingReference} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {booking.bookingReference}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.eventName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.eventSlug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.customer.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {booking.customer.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {booking.customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {booking.tickets.map((ticket, idx) => (
                          <div key={ticket._id || idx} className="text-xs">
                            {ticket.tierName}: {ticket.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {nairaFormatter.format(booking.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(booking.paidAt || booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setReminderModalBooking(booking)}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Booking actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination — use API pagination when present, else fallback to computed */}
        {!bookingsLoading && !bookingsError && bookings.length > 0 && (bookingsPagination || bookingsStats) && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {bookingsPagination?.page ?? bookingsPage} of {bookingsPagination?.totalPages ?? Math.max(1, Math.ceil((bookingsStats?.totalBookings ?? 0) / BOOKINGS_PAGE_SIZE))}
              <span className="ml-2">
                ({numberFormatter.format(bookingsPagination?.total ?? bookingsStats?.totalBookings ?? 0)} total)
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBookingsPage((p) => Math.max(1, p - 1))}
                disabled={bookingsPagination ? !bookingsPagination.hasPrev : bookingsPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setBookingsPage((p) => p + 1)}
                disabled={bookingsPagination ? !bookingsPagination.hasNext : (bookingsPage >= Math.ceil((bookingsStats?.totalBookings ?? 0) / BOOKINGS_PAGE_SIZE))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking reminder modal */}
      {reminderModalBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setReminderModalBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-modal-title"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border dark:border-gray-800 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="reminder-modal-title" className="text-lg font-semibold dark:text-white mb-1">
              Send reminder
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {reminderModalBooking.customer.name} · {reminderModalBooking.bookingReference}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={reminderSending}
                onClick={async () => {
                  if (!reminderModalBooking) return
                  setReminderSending(true)
                  try {
                    const res = await fetch(
                      `/api/vendor/bookings/${encodeURIComponent(reminderModalBooking.bookingReference)}/send-reminder`,
                      { method: "POST", credentials: "include" }
                    )
                    const data = await res.json()
                    if (res.ok && data?.success) {
                      toast({
                        title: "Reminder sent",
                        description: data?.data?.message ?? "Reminder queued and will be sent shortly",
                        variant: "success",
                      })
                      setReminderModalBooking(null)
                    } else {
                      toast({
                        title: "Failed to send reminder",
                        description: data?.error?.message ?? data?.data?.message ?? "Something went wrong",
                        variant: "destructive",
                      })
                    }
                  } catch (err) {
                    toast({
                      title: "Failed to send reminder",
                      description: err instanceof Error ? err.message : "Something went wrong",
                      variant: "destructive",
                    })
                  } finally {
                    setReminderSending(false)
                  }
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>{reminderSending ? "Sending…" : "Send email reminder"}</span>
              </button>
              <button
                type="button"
                onClick={() => setReminderModalBooking(null)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-gray-900 dark:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>Send text reminder</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setReminderModalBooking(null)}
              className="mt-4 w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
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
                {nairaFormatter.format(eventAnalytics.totalRevenue)}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Average Ticket Price</span>
              <span>{nairaFormatter.format(eventAnalytics.averageTicketPrice)}</span>
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
                    ? `${nairaFormatter.format(eventAnalytics.topEvent.price)} tickets`
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

