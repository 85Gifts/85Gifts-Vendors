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
} from "lucide-react"
import { useToast } from "../ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventItem, useEvents } from "@/hooks/useEvents"
import BookingsTable from "./BookingsTable"

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
      return "text-muted-foreground bg-muted"
  }
}

export default function EventsTab() {
  const router = useRouter()
  const { toast } = useToast()
  const { events, eventsLoading, eventsError, fetchEvents, deleteEvent } = useEvents()

  const [eventSearchTerm, setEventSearchTerm] = useState("")
  const [eventFilterStatus, setEventFilterStatus] = useState<EventItem["status"] | "all">("all")

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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
      icon: Calendar,
      hasButton: true,
    },
    {
      id: 'upcoming-events',
      label: "Upcoming Events",
      value: numberFormatter.format(eventStats.upcomingEvents),
      icon: Clock,
    },
    {
      id: 'confirmed-guests',
      label: "Confirmed Guests",
      value: numberFormatter.format(eventStats.registeredAttendees),
      icon: Users,
    },
    {
      id: 'avg-fill-rate',
      label: "Avg Fill Rate",
      value: `${eventStats.averageFillRate}%`,
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
                className="bg-card border border-border rounded-xl p-6 text-foreground"
              >
                <div className={`flex items-center justify-between ${card.hasButton ? 'mb-4' : ''}`}>
                  <div>
                    <p className="text-muted-foreground text-sm">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                {card.hasButton && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push("/dashboard/events/schedule")}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule Event
                    </Button>
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
                  <div className="bg-card border border-border rounded-xl p-6 text-foreground h-full min-h-[160px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-muted-foreground text-sm">{card.label}</p>
                        <p className="text-3xl font-bold">{card.value}</p>
                      </div>
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex gap-2 h-[32px]">
                      {card.hasButton ? (
                        <Button
                          onClick={() => router.push("/dashboard/events/schedule")}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Schedule Event
                        </Button>
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          {currentSlide < statsCards.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {statsCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-primary w-8'
                    : 'bg-muted w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by name, location or type..."
            value={eventSearchTerm}
            onChange={(e) => setEventSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <select
          value={eventFilterStatus}
          onChange={(e) => setEventFilterStatus(e.target.value as EventItem["status"] | "all")}
          className="px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent capitalize"
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
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          Loading events...
        </div>
      ) : eventsError ? (
        <div className="bg-card border border-dashed border-red-300 dark:border-red-800 rounded-xl p-12 text-center text-red-600 dark:text-red-400">
          {eventsError}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          No events match your filters. Try adjusting your search or add a new experience.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.backendId ?? `${event.id}-${event.title}-${event.date}-${event.time}`}
              className="bg-card rounded-xl shadow-sm border dark:border-border hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{event.image}</div>
                    <div>
                      <h3
                        className="font-semibold text-lg dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => router.push(`/dashboard/events/${event.backendId || event.id}`)}
                      >
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        router.push(`/dashboard/events/${event.backendId || event.id}/edit`)
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(event)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {event.date} • {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees}/{event.capacity} attending
                    </span>
                  </div>
                  <Badge className={`capitalize ${getStatusColor(event.status)}`}>
                    {event.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{event.category}</span>
                  <span className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Ticket className="w-4 h-4" />
                    {event.price > 0 ? nairaFormatter.format(event.price) : "Free RSVP"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                      onClick={() => handleGenerateLink(event)}
                      className="text-sm font-medium text-primary hover:underline"
                  >
                    Generate Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingsTable
        events={events.map((e) => ({
          id: e.id,
          backendId: e.backendId,
          title: e.title,
        }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm border dark:border-border p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Event Performance</h3>
          <div className="space-y-4">
            {eventAnalytics.statusBreakdown.map(({ status, count, percentage }) => {
              const [statusTextClass] = getStatusColor(status).split(" ")
              const progressColor = statusTextClass ? statusTextClass.replace("text-", "bg-") : "bg-primary"
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground capitalize">
                    <span>{status}</span>
                    <span>
                      {count} • {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
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

        <div className="bg-card rounded-xl shadow-sm border dark:border-border p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Revenue Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Event Revenue</div>
              <div className="text-xl font-semibold text-foreground">
                {nairaFormatter.format(eventAnalytics.totalRevenue)}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Average Ticket Price</span>
              <span>{nairaFormatter.format(eventAnalytics.averageTicketPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Average Attendance</span>
              <span>{numberFormatter.format(eventAnalytics.averageAttendance)} guests</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Capacity Utilization</span>
              <span>{eventAnalytics.capacityUtilization}%</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border dark:border-border p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Engagement Highlights</h3>
          {eventAnalytics.topEvent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{eventAnalytics.topEvent.image}</div>
                <div>
                  <h4 className="font-semibold text-lg dark:text-white">{eventAnalytics.topEvent.title}</h4>
                  <p className="text-sm text-muted-foreground">{eventAnalytics.topEvent.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.date} • {eventAnalytics.topEvent.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.attendees} guests confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.price > 0
                    ? `${nairaFormatter.format(eventAnalytics.topEvent.price)} tickets`
                    : "Free RSVP"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Add events to unlock engagement insights.</p>
          )}
        </div>
      </div>
    </div>
  )
}

