"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useToast } from "../ui/use-toast"

export interface BankOption {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  type: string
  active: boolean
  country: string
  currency: string
}

export interface WithdrawalBankFormData {
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
}

interface AddWithdrawalBankModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: WithdrawalBankFormData) => void | Promise<void>
}

export default function AddWithdrawalBankModal({
  open,
  onClose,
  onSubmit,
}: AddWithdrawalBankModalProps) {
  const { toast } = useToast()
  const [banks, setBanks] = useState<BankOption[]>([])
  const [banksLoading, setBanksLoading] = useState(false)
  const [banksError, setBanksError] = useState("")
  const [selectedBankCode, setSelectedBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [resolveLoading, setResolveLoading] = useState(false)
  const [resolveError, setResolveError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelectedBankCode("")
      setAccountNumber("")
      setAccountName("")
      setResolveError("")
      setSubmitting(false)
      setBanksError("")
    }
  }, [open])

  // Resolve account name when we have 10 digits and a bank selected
  useEffect(() => {
    if (!open || accountNumber.length !== 10 || !selectedBankCode) {
      if (accountNumber.length !== 10) setResolveError("")
      return
    }
    let cancelled = false
    setResolveLoading(true)
    setResolveError("")
    setAccountName("")
    const params = new URLSearchParams({ accountNumber, bankCode: selectedBankCode })
    fetch(`/api/paystack/resolve-account?${params}`, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success && data?.data?.data?.accountName) {
          setAccountName(data.data.data.accountName)
        } else {
          setResolveError(data?.error?.message ?? data?.error ?? data?.data?.message ?? "Could not resolve account name")
        }
      })
      .catch(() => {
        if (!cancelled) setResolveError("Could not resolve account name")
      })
      .finally(() => {
        if (!cancelled) setResolveLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, accountNumber, selectedBankCode])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBanksLoading(true)
    setBanksError("")
    fetch("/api/paystack/banks", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success && Array.isArray(data?.data?.data)) {
          setBanks(data.data.data)
        } else {
          setBanksError(data?.error?.message ?? data?.error ?? data?.data?.message ?? "Failed to load banks")
        }
      })
      .catch(() => {
        if (!cancelled) setBanksError("Failed to load banks")
      })
      .finally(() => {
        if (!cancelled) setBanksLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const selectedBank = banks.find((b) => b.code === selectedBankCode)

  // Clear resolved name when user changes account number or bank
  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value)
    if (value.length !== 10) setAccountName("")
  }
  const handleBankChange = (code: string) => {
    setSelectedBankCode(code)
    setAccountName("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!selectedBank) return
    setSubmitting(true)
    const payload = {
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      accountNumber,
      accountName,
    }
    try {
      const res = await fetch("/api/vendor/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          isDefault: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? data?.error ?? "Failed to add bank account"
        toast({ title: "Error", description: message, variant: "destructive" })
        return
      }
      toast({
        title: "Bank added",
        description: data?.data?.message ?? "Withdrawal bank account added successfully.",
        variant: "success",
      })
      await onSubmit?.(payload)
      onClose()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add bank account",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-withdrawal-bank-title"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 id="add-withdrawal-bank-title" className="text-lg font-semibold dark:text-white">
            Add withdrawal bank
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bank name
            </label>
            <select
              id="bank-name"
              value={selectedBankCode}
              onChange={(e) => handleBankChange(e.target.value)}
              required
              disabled={submitting || banksLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
            >
              <option value="">
                {banksLoading ? "Loading banks…" : banksError ? "Error loading banks" : "Select a bank"}
              </option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {banksError && !banksLoading && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{banksError}</p>
            )}
          </div>
          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account number
            </label>
            <input
              type="text"
              id="account-number"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10 digits"
              required
              maxLength={10}
              disabled={submitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account name
            </label>
            <input
              type="text"
              id="account-name"
              value={accountName}
              readOnly
              placeholder={resolveLoading ? "Resolving…" : "Enter account number to resolve"}
              required
              disabled={submitting || resolveLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50 read-only:bg-gray-50 dark:read-only:bg-gray-800/50 read-only:cursor-default"
            />
            {resolveError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{resolveError}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || resolveLoading || !accountName}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Saving…" : "Add bank"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
