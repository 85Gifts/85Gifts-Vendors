"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import EventForm from "../../../../../../components/events/EventForm"
import { config } from "../../../../../../config"

type ApiTier = { name: string; description?: string; price: number; capacity: number; type?: string }

export default function EditEventPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
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
        const token = Cookies.get("authToken")
        const res = await fetch(`${config.BACKEND_URL}/api/vendor/events/${eventId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        })
        if (!res || !res.ok) {
          const msg = await res.text()
          throw new Error(msg || "Failed to load event")
        }
        const json = await res.json()
        const e =
          json?.data?.data?.event ||
          json?.data?.event ||
          json?.event ||
          json

        const start = new Date(e.startAt)
        const end = e.endAt ? new Date(e.endAt) : null
        const salesStart = e?.salesPeriod?.start ? new Date(e.salesPeriod.start) : null
        const salesEnd = e?.salesPeriod?.end ? new Date(e.salesPeriod.end) : null

        const toD = (d?: Date | null) =>
          d
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
            : ""
        const toT = (d?: Date | null) =>
          d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : ""

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
          endDate: toD(end || undefined),
          endTime: toT(end || undefined),
          salesStartDate: toD(salesStart || undefined),
          salesStartTime: toT(salesStart || undefined),
          salesEndDate: toD(salesEnd || undefined),
          salesEndTime: toT(salesEnd || undefined),
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

  return (
    <EventForm
      mode="edit"
      eventId={eventId}
      initialValues={initialValues || {}}
      initialTiers={initialTiers}
    />
  )
}


