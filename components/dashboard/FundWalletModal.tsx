"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
  vendorEmail?: string
}

export default function FundWalletModal({
  open,
  onClose,
  vendorEmail,
}: FundWalletModalProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setLoading(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) {
      alert("Please enter a valid amount")
      return
    }
    if (!vendorEmail) {
      alert("Email not found. Please try again later.")
      return
    }
    try {
      setLoading(true)
      const response = await fetch("/api/paystack/funding/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: num, email: vendorEmail }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(
          data?.error ?? data?.message ?? "Failed to initialize payment"
        )
      }
      const authorizationUrl = data?.data?.data?.authorizationUrl
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      } else {
        throw new Error("Authorization URL not found in response")
      }
    } catch (err) {
      console.error("Error initializing payment:", err)
      alert(
        err instanceof Error ? err.message : "Failed to initialize payment. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold dark:text-white">Fund Wallet</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="fund-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="fund-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        </form>
      </div>
    </div>
  )
}
