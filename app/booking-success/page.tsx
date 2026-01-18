"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, XCircle, Ticket, Calendar, Mail, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { config } from "@/config"

interface BookingData {
  bookingReference: string
  eventName: string
  eventSlug: string
  customer: {
    name: string
    email: string
  }
  tickets: Array<{
    tierName: string
    quantity: number
    pricePerTicket: number
    totalPrice: number
    _id?: string
  }>
  totalAmount: number
  paymentStatus: string
  paidAt?: string
  createdAt: string
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const trxref = searchParams.get("trxref")
  const reference = searchParams.get("reference")
  const bookingReference = reference || trxref

  useEffect(() => {
    const fetchBookingStatus = async () => {
      if (!bookingReference) {
        setStatus("error")
        setErrorMessage("Missing payment reference. Please contact support.")
        return
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          config.BACKEND_URL

        const response = await fetch(
          `${API_URL}/api/public/bookings/${bookingReference}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error?.message ||
            data?.message ||
            data?.error ||
            "Failed to verify booking"
          )
        }

        // Extract booking data from response
        const booking = data?.data?.data ?? data?.data ?? data

        if (booking) {
          setBookingData(booking)
          setStatus("success")
        } else {
          throw new Error("Booking data not found in response")
        }
      } catch (error: any) {
        console.error("Error fetching booking status:", error)
        setStatus("error")
        setErrorMessage(
          error?.message ||
          "Failed to verify your booking. Please contact support with your reference number."
        )
      }
    }

    fetchBookingStatus()
  }, [bookingReference])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your booking.
          </p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "success" && !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Data Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to retrieve booking information. Please contact support.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your tickets have been successfully reserved. Check your email for
            confirmation details.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Ticket className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="font-semibold text-gray-900">
                {bookingData.bookingReference}
              </p>
            </div>
          </div>

          {bookingData.eventName && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Event</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.eventName}
                </p>
              </div>
            </div>
          )}

          {bookingData.customer && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <User className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.customer.name}
                </p>
                <p className="text-sm text-gray-500">{bookingData.customer.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Payment Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  bookingData.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : bookingData.paymentStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {bookingData.paymentStatus?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
          </div>

          {bookingData.totalAmount !== undefined && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {formatCurrency(bookingData.totalAmount)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {bookingData.tickets && bookingData.tickets.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ticket Details
            </h3>
            <div className="space-y-3">
              {bookingData.tickets.map((ticket, index: number) => (
                <div
                  key={ticket._id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ticket.tierName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {ticket.quantity} × {formatCurrency(ticket.pricePerTicket)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(ticket.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            What's Next?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>A confirmation email has been sent to your email address</li>
            <li>Please arrive at the venue 30 minutes before the event starts</li>
            <li>Bring a valid ID and your booking reference</li>
            <li>Check your spam folder if you don't see the email</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {bookingData.eventSlug && (
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/event/${bookingData.eventSlug}`}>
                View Event
              </Link>
            </Button>
          )}
          <Button asChild className="flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <a
              href={`mailto:support@85gifts.com?subject=Booking Inquiry: ${bookingData.bookingReference}`}
            >
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  )
}