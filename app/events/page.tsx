import { config } from "@/config"
import PublicEventsListing from "@/components/events/PublicEventsListing"

export type PublicEventTier = {
  name: string
  price: number
  capacity: number
  sold: number
  remaining?: number
  minPerOrder?: number
  maxPerOrder?: number
  _id?: string
}

export type PublicEvent = {
  _id?: string
  name: string
  slug: string
  description?: string
  organiserName?: string
  startAt?: string
  endAt?: string
  coverImageUrl?: string
  location?: {
    venue?: string
    venueName?: string
    address?: string
    city?: string
    state?: string
    country?: string
  }
  tiers?: PublicEventTier[]
}

const API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || config.BACKEND_URL

const getPublicEvents = async (): Promise<PublicEvent[]> => {
  try {
    const res = await fetch(`${API_URL}/api/public/events`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error("Failed to fetch events")
    }
    const payload = await res.json()
    const data = payload?.data?.data ?? payload?.data ?? payload
    const events = Array.isArray(data) ? data : data?.events
    return Array.isArray(events) ? events.filter((e: any) => e?.slug) : []
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await getPublicEvents()

  return <PublicEventsListing events={events} />
}

export async function generateMetadata() {
  return {
    title: "Events | 85Gifts",
    description: "Discover upcoming events and book your tickets on 85Gifts.",
  }
}
