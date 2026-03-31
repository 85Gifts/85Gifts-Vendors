import type { Booking } from "@/components/events/BookingsTable"
import { downloadCsvFile, rowsToCsv } from "@/lib/csvExport"

const HEADERS = [
  "Booking Reference",
  "Event ID",
  "Event Slug",
  "Event Name",
  "Customer Name",
  "Customer Email",
  "Customer Phone",
  "Tickets Summary",
  "Subtotal",
  "Total Amount",
  "Payment Status",
  "Payment Method",
  "Paid At",
  "Created At",
  "Updated At",
] as const

function bookingToRow(booking: Booking): string[] {
  const ticketsSummary = booking.tickets
    .map((t) => `${t.tierName} x${t.quantity}`)
    .join("; ")

  return [
    booking.bookingReference,
    booking.eventId,
    booking.eventSlug,
    booking.eventName,
    booking.customer.name,
    booking.customer.email,
    booking.customer.phone,
    ticketsSummary,
    String(booking.subtotal),
    String(booking.totalAmount),
    booking.paymentStatus,
    booking.paymentMethod,
    booking.paidAt ?? "",
    booking.createdAt,
    booking.updatedAt,
  ]
}

/**
 * Build CSV text for a list of bookings (same columns as the bookings table).
 */
export function bookingsToCsvString(bookings: Booking[]): string {
  const rows: string[][] = [Array.from(HEADERS), ...bookings.map(bookingToRow)]
  return rowsToCsv(rows)
}

/**
 * Download bookings as a .csv file in the browser.
 */
export function downloadBookingsCsv(bookings: Booking[], filenameBase = "bookings"): void {
  const safe = filenameBase.replace(/[^a-z0-9-_]/gi, "_").slice(0, 80) || "bookings"
  const date = new Date().toISOString().slice(0, 10)
  const filename = `${safe}-${date}.csv`
  downloadCsvFile(filename, bookingsToCsvString(bookings))
}
