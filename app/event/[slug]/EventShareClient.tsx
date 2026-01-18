"use client"

import { useState } from "react"
import BookingModal from "../../../components/events/BookingModal"

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

interface EventShareClientProps {
  event: PublicEvent
}

const formatDateTime = (iso?: string) => {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    // Use UTC to ensure consistent formatting between server and client
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date)
  } catch {
    return ""
  }
}

export default function EventShareClient({ event }: EventShareClientProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const eventTime = formatDateTime(event.startAt)
  const venue = event.location?.venueName
  const city = event.location?.city
  const country = event.location?.country
  const locationText = [venue, city, country].filter(Boolean).join(" • ")

  return (
    <>
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
              <p className="mt-3 text-white/80">
                Hosted by {event.organiserName}
              </p>
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
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </section>

        <section id="book" className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Booking</h2>
            <p className="mt-3 text-gray-600">
              Click the "Book Now" button above to reserve your tickets.
            </p>
          </div>
        </section>
      </main>

      {event.tiers && event.tiers.length > 0 && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          eventSlug={event.slug}
          eventName={event.name}
          tiers={event.tiers}
        />
      )}
    </>
  )
}