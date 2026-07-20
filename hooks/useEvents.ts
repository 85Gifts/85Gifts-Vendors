"use client"

import { useState, useCallback } from "react"
import { redirectToLogin } from "@/lib/authRedirect"
import { useToast } from "@/components/ui/use-toast"

export interface EventItem {
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

export function useEvents() {
  const { toast } = useToast()
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState<boolean>(false)
  const [eventsError, setEventsError] = useState<string>("")

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true)
      setEventsError("")
      const res = await fetch("/api/events", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to load events" }))
        throw new Error(errorData.error?.message || errorData.message || errorData.error || "Failed to load events")
      }
      const json = await res.json()
      const apiEvents =
        json?.data?.data?.events ||
        json?.data?.events ||
        json?.events ||
        (Array.isArray(json) ? json : [])

      const computeStatus = (startIso?: string, endIso?: string): EventItem["status"] => {
        if (!startIso) return "upcoming"
        const now = new Date()
        const start = new Date(startIso)
        const end = endIso ? new Date(endIso) : undefined
        if (end && now > end) return "completed"
        if (now >= start && (!end || now <= end)) return "ongoing"
        return "upcoming"
      }

      const toDate = (iso?: string) => {
        if (!iso) return { date: "", time: "" }
        const d = new Date(iso)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        const hh = String(d.getHours()).padStart(2, "0")
        const mi = String(d.getMinutes()).padStart(2, "0")
        return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` }
      }

      const mapped: EventItem[] = apiEvents.map((e: any) => {
        const { date, time } = toDate(e.startAt)
        const status = computeStatus(e.startAt, e.endAt)
        const tiers = Array.isArray(e.tiers) ? e.tiers : []
        const minPrice = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.price || 0))) : 0
        const totalCapacity = tiers.length ? tiers.reduce((s: number, t: any) => s + Number(t.capacity || 0), 0) : 0
        const location =
          e?.location?.venue ||
          e?.location?.address ||
          [e?.location?.city, e?.location?.state].filter(Boolean).join(", ") ||
          "TBA"
        const approvalStatus =
          e?.approvalStatus || e?.approval_status || e?.reviewStatus || e?.status
        return {
          id: Number(e.id || e._id ? undefined : Date.now() + Math.random() * 1000) || Date.now(),
          backendId: String(e._id || e.id || ""),
          slug: e?.slug || e?.linkSlug || e?.eventSlug || undefined,
          title: e.name || "Untitled Event",
          category: e.category || "other",
          date,
          time,
          location,
          price: minPrice,
          capacity: Number(e.totalCapacity ?? totalCapacity ?? 0),
          attendees: Number(e.totalSold ?? e.attendees ?? 0),
          status,
          image: e.emoji || "🎉",
          description: e.description || "",
          approvalStatus,
          isApproved:
            typeof e?.isApproved === "boolean"
              ? e.isApproved
              : typeof e?.isPublished === "boolean"
              ? e.isPublished
              : undefined,
          approved: typeof e?.approved === "boolean" ? e.approved : undefined,
        }
      })
      setEvents(mapped)
    } catch (err: any) {
      setEventsError(err?.message || "Failed to load events")
    } finally {
      setEventsLoading(false)
    }
  }, [])

  const deleteEvent = useCallback(
    async (event: EventItem) => {
      const eventId = String(event.backendId || event.id)
      try {
        setEventsLoading(true)
        setEventsError("")
        const res = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        })
        if (res.status === 401) {
          redirectToLogin()
          return false
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to delete event" }))
          throw new Error(errorData.error?.message || errorData.message || errorData.error || "Failed to delete event")
        }
        setEvents((prev) => prev.filter((e) => String(e.backendId || e.id) !== eventId))
        toast({
          title: "Event deleted",
          description: `"${event.title}" was removed successfully.`,
          variant: "success",
        })
        return true
      } catch (err: any) {
        setEventsError(err?.message || "Failed to delete event")
        toast({
          title: "Delete failed",
          description: err?.message || "Unable to delete event",
          variant: "destructive",
        })
        return false
      } finally {
        setEventsLoading(false)
      }
    },
    [toast]
  )

  return { events, eventsLoading, eventsError, fetchEvents, deleteEvent }
}
