"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
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
    try {
      setLoading(true)
      const response = await fetch("/api/vendor/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: num }),
      })
      const data = await response.json()
      if (!response.ok) {
        const message =
          data?.error?.message ?? data?.error ?? data?.message ?? "Failed to withdraw"
        alert(message)
        return
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to withdraw. Please try again.")
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
          <h3 className="text-lg font-semibold dark:text-white">Withdraw</h3>
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
              htmlFor="withdraw-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        </form>
      </div>
    </div>
  )
}
