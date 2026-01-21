"use client"

import React, { useState } from "react"
import { X, Ticket, Plus, Minus } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"
import { config } from "../../config"

interface TicketTier {
  name: string
  price: number
  capacity: number
  sold: number
  remaining?: number
  minPerOrder?: number
  maxPerOrder?: number
  _id?: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  eventSlug: string
  eventName: string
  tiers: TicketTier[]
}

interface TicketSelection {
  tierName: string
  quantity: number
}

export default function BookingModal({
  isOpen,
  onClose,
  eventSlug,
  eventName,
  tiers,
}: BookingModalProps) {
  const { toast } = useToast()
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [ticketSelections, setTicketSelections] = useState<
    Record<string, number>
  >(() => {
    const initial: Record<string, number> = {}
    tiers.forEach((tier) => {
      initial[tier.name] = 0
    })
    return initial
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (!isSubmitting) {
      setCustomer({ name: "", email: "", phone: "" })
      setTicketSelections(() => {
        const reset: Record<string, number> = {}
        tiers.forEach((tier) => {
          reset[tier.name] = 0
        })
        return reset
      })
      onClose()
    }
  }

  const updateTicketQuantity = (tierName: string, delta: number) => {
    const tier = tiers.find((t) => t.name === tierName)
    if (!tier) return

    const currentQty = ticketSelections[tierName] || 0
    const newQty = Math.max(0, currentQty + delta)

    // Check min/max constraints
    if (tier.minPerOrder && newQty > 0 && newQty < tier.minPerOrder) {
      return
    }
    if (tier.maxPerOrder && newQty > tier.maxPerOrder) {
      toast({
        title: "Maximum tickets exceeded",
        description: `You can order a maximum of ${tier.maxPerOrder} ${tierName} tickets`,
        variant: "destructive",
      })
      return
    }

    // Check availability
    const available = tier.remaining ?? (tier.capacity - tier.sold)
    if (newQty > available) {
      toast({
        title: "Tickets unavailable",
        description: `Only ${available} ${tierName} tickets available`,
        variant: "destructive",
      })
      return
    }

    setTicketSelections((prev) => ({
      ...prev,
      [tierName]: newQty,
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const calculateTotal = () => {
    return tiers.reduce((total, tier) => {
      const qty = ticketSelections[tier.name] || 0
      return total + tier.price * qty
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all customer details",
        variant: "destructive",
      })
      return
    }

    if (getTotalTickets() === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket",
        variant: "destructive",
      })
      return
    }

    // Build tickets array
    const tickets: TicketSelection[] = Object.entries(ticketSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([tierName, quantity]) => ({
        tierName,
        quantity,
      }))

    setIsSubmitting(true)

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        config.BACKEND_URL

      const callbackUrl = `${window.location.origin}/booking-success`

      const response = await fetch(
        `${API_URL}/api/public/events/${eventSlug}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer,
            tickets,
            callbackUrl,
          }),
        }
      )

      const data = await response.json()

      // Check for error response (success: false)
      if (data.success === false || !response.ok) {
        // Extract error message from various possible structures
        const errorMessage =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          "Failed to book tickets. Please try again."
        
        toast({
          title: "Booking failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Extract payment URL from response
      const paymentUrl = data?.data?.data?.paymentUrl ?? data?.data?.paymentUrl
      
      if (paymentUrl) {
        // Redirect to Paystack checkout immediately
        window.location.href = paymentUrl
        // Note: Execution stops here due to redirect, so finally block won't execute
        return
      } else {
        toast({
          title: "Payment error",
          description: "Payment URL not found in response. Please contact support.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // Handle network errors or JSON parsing errors
      const errorMessage =
        error?.message ||
        "An unexpected error occurred. Please check your connection and try again."
      
      toast({
        title: "Booking failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      // Always reset submitting state (won't execute if redirect happens)
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Book Tickets
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {eventName}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Your Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  placeholder="+2341234567890"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Select Tickets
            </h4>
            <div className="space-y-4">
              {tiers.map((tier) => {
                const qty = ticketSelections[tier.name] || 0
                const available = tier.remaining ?? (tier.capacity - tier.sold)
                const isOutOfStock = available <= 0

                return (
                  <div
                    key={tier.name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            {tier.name}
                          </h5>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {formatCurrency(tier.price)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {available} available
                        </p>
                      </div>

                      {!isOutOfStock ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(tier.name, -1)}
                            disabled={
                              isSubmitting ||
                              qty === 0 ||
                              (tier.minPerOrder
                                ? qty <= tier.minPerOrder
                                : false)
                            }
                            className="rounded-full border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(tier.name, 1)}
                            disabled={
                              isSubmitting ||
                              qty >= available ||
                              (tier.maxPerOrder
                                ? qty >= tier.maxPerOrder
                                : false)
                            }
                            className="rounded-full border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {tier.minPerOrder && qty > 0 && qty < tier.minPerOrder && (
                      <p className="text-xs text-amber-600 mt-2">
                        Minimum {tier.minPerOrder} ticket(s) required for this
                        tier
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          {getTotalTickets() > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  Total Tickets:
                </span>
                <span className="font-semibold text-gray-900">
                  {getTotalTickets()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || getTotalTickets() === 0}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : "Complete Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}