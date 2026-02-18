"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react"
import { useToast } from "../ui/use-toast"

export interface Booking {
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

export interface EventOption {
  id: number
  backendId?: string
  title: string
}

const BOOKINGS_PAGE_SIZE = 10

function getPaymentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
    case "pending":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
    case "failed":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700"
  }
}

function formatDate(dateString?: string): string {
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

interface BookingsTableProps {
  events: EventOption[]
}

export default function BookingsTable({ events }: BookingsTableProps) {
  const { toast } = useToast()
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), [])
  const nairaFormatter = useMemo(
    () => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
    []
  )

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
  const [reminderModalBooking, setReminderModalBooking] = useState<Booking | null>(null)
  const [reminderSending, setReminderSending] = useState(false)
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set())
  const [bulkSending, setBulkSending] = useState(false)

  const selectedCount = selectedRefs.size
  const allOnPageSelected =
    bookings.length > 0 && bookings.every((b) => selectedRefs.has(b.bookingReference))
  const someOnPageSelected = bookings.some((b) => selectedRefs.has(b.bookingReference))

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedRefs((prev) => {
        const next = new Set(prev)
        bookings.forEach((b) => next.delete(b.bookingReference))
        return next
      })
    } else {
      setSelectedRefs((prev) => {
        const next = new Set(prev)
        bookings.forEach((b) => next.add(b.bookingReference))
        return next
      })
    }
  }

  const toggleSelectRow = (ref: string) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev)
      if (next.has(ref)) next.delete(ref)
      else next.add(ref)
      return next
    })
  }

  const clearSelection = () => setSelectedRefs(new Set())

  const sendBulkReminders = async (type: "email" | "text") => {
    if (selectedCount === 0) return
    const refs = Array.from(selectedRefs)
    setBulkSending(true)
    let success = 0
    let failed = 0
    const errorMessages: string[] = []
    for (const ref of refs) {
      try {
        const res = await fetch(
          `/api/vendor/bookings/${encodeURIComponent(ref)}/send-reminder`,
          { method: "POST", credentials: "include" }
        )
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.success) {
          success++
        } else {
          failed++
          const msg =
            data?.error?.message ??
            (typeof data?.error === "string" ? data.error : null) ??
            data?.data?.message ??
            data?.message ??
            `Request failed (${res.status})`
          if (msg && !errorMessages.includes(msg)) errorMessages.push(msg)
        }
      } catch (err) {
        failed++
        const msg = err instanceof Error ? err.message : "Network or unexpected error"
        if (!errorMessages.includes(msg)) errorMessages.push(msg)
      }
    }
    setBulkSending(false)
    setSelectedRefs(new Set())
    if (failed === 0) {
      toast({
        title: "Reminders sent",
        description: `${success} ${type} reminder(s) queued.`,
        variant: "success",
      })
    } else {
      const errorDetail =
        errorMessages.length > 0
          ? ` — ${errorMessages.slice(0, 2).join(". ")}${errorMessages.length > 2 ? " …" : ""}`
          : ""
      toast({
        title: "Partially completed",
        description: `${success} sent, ${failed} failed${errorDetail}`,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    setBookingsPage(1)
  }, [bookingsEventId, bookingsSearch])

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
          headers: { "Content-Type": "application/json" },
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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load bookings"
        console.error("Error fetching bookings:", error)
        setBookingsError(message)
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [bookingsEventId, bookingsSearch, bookingsPage])

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">Recent Bookings</h3>
              {bookingsStats && (
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {numberFormatter.format(bookingsStats.totalBookings)}</span>
                  <span title="This page only">
                    This page — Revenue: {nairaFormatter.format(bookingsStats.totalRevenue)}
                  </span>
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
          <>
            {selectedCount > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCount} selected
                </span>
                <button
                  type="button"
                  onClick={() => sendBulkReminders("email")}
                  disabled={bulkSending}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Mail className="w-4 h-4" />
                  {bulkSending ? "Sending…" : "Send email reminder"}
                </button>
                <button
                  type="button"
                  onClick={() => sendBulkReminders("text")}
                  disabled={bulkSending}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send text reminder
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear selection
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      aria-label="Select all rows on this page"
                    />
                  </th>
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
                  <tr
                    key={booking.bookingReference}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedRefs.has(booking.bookingReference) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <td className="px-4 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRefs.has(booking.bookingReference)}
                        onChange={() => toggleSelectRow(booking.bookingReference)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        aria-label={`Select ${booking.bookingReference}`}
                      />
                    </td>
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
          </>
        )}

        {!bookingsLoading && !bookingsError && bookings.length > 0 && (bookingsPagination || bookingsStats) && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {bookingsPagination?.page ?? bookingsPage} of{" "}
              {bookingsPagination?.totalPages ??
                Math.max(1, Math.ceil((bookingsStats?.totalBookings ?? 0) / BOOKINGS_PAGE_SIZE))}
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
                disabled={
                  bookingsPagination
                    ? !bookingsPagination.hasNext
                    : bookingsPage >= Math.ceil((bookingsStats?.totalBookings ?? 0) / BOOKINGS_PAGE_SIZE)
                }
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
    </>
  )
}
