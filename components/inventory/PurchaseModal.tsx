"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { config } from "@/config"
import { PublicProduct } from "@/app/types/inventory"

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  slug: string
  products: PublicProduct[]
  totalAmount: number
}

export default function PurchaseModal({
  isOpen,
  onClose,
  slug,
  products,
  totalAmount,
}: PurchaseModalProps) {
  const { toast } = useToast()
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (!isSubmitting) {
      setCustomer({ name: "", email: "", phone: "" })
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!customer.name || !customer.email || !customer.phone) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customer.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        config.BACKEND_URL

      const callbackUrl = `${window.location.origin}/purchase-success`

      const response = await fetch(
        `${API_URL}/api/public/inventory/${slug}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer,
            callbackUrl,
          }),
        }
      )

      const data = await response.json()

      // Check for error response
      if (data.success === false || !response.ok) {
        const errorMessage =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          "Failed to process purchase. Please try again."

        toast({
          title: "Purchase failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Extract payment URL from response
      const paymentUrl =
        data?.data?.data?.paymentUrl ?? data?.data?.paymentUrl

      if (paymentUrl) {
        // Redirect to Paystack checkout immediately
        window.location.href = paymentUrl
        // Note: Execution stops here due to redirect
        return
      } else {
        toast({
          title: "Payment error",
          description: "Payment URL not found in response. Please contact support.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "An unexpected error occurred. Please check your connection and try again."

      toast({
        title: "Purchase failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
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
              Complete Your Purchase
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Total: ₦
              {totalAmount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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

        {/* Products Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">
            Order Summary
          </h4>
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.inventoryId}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>
                  {product.name} × {product.quantity}
                </span>
                <span className="font-medium">
                  ₦
                  {product.total.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900">
              Total
            </span>
            <span className="text-xl font-bold text-blue-600">
              ₦
              {totalAmount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Customer Information Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+234 800 000 0000"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
