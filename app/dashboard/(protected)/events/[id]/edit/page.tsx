"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import EventForm from "../../../../../../components/events/EventForm"

type ApiTier = { name: string; description?: string; price: number; capacity: number; type?: string }

export default function EditEventPage() {
  const params = useParams() as { id?: string }
  const eventId = (params?.id as string) || ""
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [initialValues, setInitialValues] = useState<any>(null)
  const [initialTiers, setInitialTiers] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    async function run() {
      if (!eventId) return
      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/events/${eventId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        })
        if (!res || !res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.message || json.error || "Failed to load event")
        }
        const json = await res.json()
        
        // Extract event from API response structure: {success: true, data: {data: {event object}}}
        const e = json?.data?.data || json?.data || json

        // Helper function to safely parse dates
        const parseDate = (dateString?: string | null): Date | null => {
          if (!dateString) return null
          const date = new Date(dateString)
          return isNaN(date.getTime()) ? null : date
        }

        const start = parseDate(e.startAt)
        const end = parseDate(e.endAt)
        const salesStart = parseDate(e?.salesPeriod?.start)
        const salesEnd = parseDate(e?.salesPeriod?.end)

        const toD = (d?: Date | null) => {
          if (!d || isNaN(d.getTime())) return ""
          const year = d.getFullYear()
          const month = d.getMonth() + 1
          const day = d.getDate()
          if (isNaN(year) || isNaN(month) || isNaN(day)) return ""
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        }
        
        const toT = (d?: Date | null) => {
          if (!d || isNaN(d.getTime())) return ""
          const hours = d.getHours()
          const minutes = d.getMinutes()
          if (isNaN(hours) || isNaN(minutes)) return ""
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
        }

        const initVals = {
          title: e.name ?? "",
          category: e.category ?? "",
          date: toD(start),
          time: toT(start),
          location:
            e?.location?.address || [e?.location?.city, e?.location?.state].filter(Boolean).join(", "),
          emoji: e?.emoji ?? "",
          description: e?.description ?? "",
          organiserName: e?.organiserName ?? "",
          endDate: toD(end),
          endTime: toT(end),
          salesStartDate: toD(salesStart),
          salesStartTime: toT(salesStart),
          salesEndDate: toD(salesEnd),
          salesEndTime: toT(salesEnd),
          venue: e?.location?.venue ?? "",
          address: e?.location?.address ?? "",
          city: e?.location?.city ?? "",
          state: e?.location?.state ?? "",
          country: e?.location?.country ?? "",
          coverImageUrl: e?.coverImageUrl ?? "",
          tags: Array.isArray(e?.tags) ? e.tags.join(", ") : "",
          price: "",
          capacity: "",
        }

        const tiers: any[] = Array.isArray(e?.tiers)
          ? e.tiers.map((t: ApiTier) => ({
              name: t.name ?? "",
              description: t.description ?? "",
              price: String(t.price ?? 0),
              capacity: String(t.capacity ?? 0),
              type: (t.type as any) ?? "general",
            }))
          : []

        if (!isMounted) return
        setInitialValues(initVals)
        setInitialTiers(tiers)
      } catch (err: any) {
        if (!isMounted) return
        setError(err?.message || "Failed to load event")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [eventId])

  if (!eventId) return <div className="p-6">Invalid event id.</div>
  if (loading) return <div className="p-6">Loading event…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!initialValues) return <div className="p-6">Loading event data…</div>

  return (
    <EventForm
      mode="edit"
      eventId={eventId}
      initialValues={initialValues}
      initialTiers={initialTiers}
    />
  )
}


