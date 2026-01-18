import { notFound } from "next/navigation"
import { config } from "../../../config"
import EventShareClient from "./EventShareClient"

type TicketTier = {
  name: string
  price: number
  capacity: number
  sold: number
  remaining?: number
  minPerOrder?: number
  maxPerOrder?: number
  _id?: string
}

type PublicEvent = {
  _id?: string
  name: string
  slug: string
  description?: string
  organiserName?: string
  startAt?: string
  endAt?: string
  coverImageUrl?: string
  location?: {
    venueName?: string
    address?: string
    city?: string
    state?: string
    country?: string
  }
  tiers?: TicketTier[]
}

const API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || config.BACKEND_URL

const formatDateTime = (iso?: string) => {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const normalizeEvent = (payload: any): PublicEvent | null => {
  const event = payload?.data?.data ?? payload?.data ?? payload
  if (!event?.slug) return null
  return event
}

const getEventBySlug = async (slug: string): Promise<PublicEvent | null> => {
  if (!slug) return null
  const res = await fetch(`${API_URL}/api/public/events/${slug}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch event")
  const payload = await res.json()
  return normalizeEvent(payload)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params
    const event = await getEventBySlug(slug)
    if (!event) return { title: "Event not found" }
    return {
      title: `${event.name} | 85Gifts`,
      description: event.description || `Book tickets for ${event.name}`,
    }
  } catch {
    return { title: "Event" }
  }
}

export default async function EventSharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  return <EventShareClient event={event} />
}
