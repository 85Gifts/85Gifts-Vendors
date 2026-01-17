import { notFound } from "next/navigation"
import Link from "next/link"
import { config } from "../../../config"

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

  const eventTime = formatDateTime(event.startAt)
  const venue = event.location?.venueName
  const city = event.location?.city
  const country = event.location?.country
  const locationText = [venue, city, country].filter(Boolean).join(" • ")

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: event.coverImageUrl
              ? `url(${event.coverImageUrl})`
              : "none",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <p className="text-sm uppercase tracking-wider text-white/70">
            Event Experience
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            {event.name}
          </h1>
          {event.organiserName ? (
            <p className="mt-3 text-white/80">Hosted by {event.organiserName}</p>
          ) : null}
          {eventTime ? (
            <p className="mt-3 text-white/80">{eventTime}</p>
          ) : null}
          {locationText ? (
            <p className="mt-2 text-white/70">{locationText}</p>
          ) : null}
          {event.description ? (
            <p className="mt-6 text-lg text-white/90">{event.description}</p>
          ) : null}

          <div className="mt-10">
            <Link
              href="#book"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section id="book" className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Booking</h2>
          <p className="mt-3 text-gray-600">
            Ticket booking will be available here soon.
          </p>
        </div>
      </section>
    </main>
  )
}
