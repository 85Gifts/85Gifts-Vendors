"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AmountStepper } from "@/components/ui/amount-stepper"

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
        className="bg-card rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-border">
          <h3 className="text-lg font-semibold dark:text-white">Withdraw</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="withdraw-amount"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Amount
            </label>
            <AmountStepper
              id="withdraw-amount"
              value={amount}
              onChange={setAmount}
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="warning"
            disabled={loading}
            className="w-full font-medium py-2.5"
          >
            {loading ? "Processing..." : "Proceed"}
          </Button>
        </form>
      </div>
    </div>
  )
}
