"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Building2 } from "lucide-react"
import AddWithdrawalBankModal from "./AddWithdrawalBankModal"

interface Wallet {
  balance: number
  currency: string
  pendingWithdrawals: number
  availableBalance: number
  totalEarnings: number
  totalWithdrawals: number
}

interface VendorBank {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault?: boolean
  createdAt?: string
}

interface PerformanceMetricsCardProps {
  wallet: Wallet | null
  walletLoading: boolean
  walletError: string
  currencyFormatter: Intl.NumberFormat
}

export default function PerformanceMetricsCard({
  wallet,
  walletLoading,
  walletError,
  currencyFormatter,
}: PerformanceMetricsCardProps) {
  const [withdrawalBankModalOpen, setWithdrawalBankModalOpen] = useState(false)
  const [banks, setBanks] = useState<VendorBank[]>([])
  const [banksLoading, setBanksLoading] = useState(true)
  const [banksError, setBanksError] = useState("")

  const fetchBanks = () => {
    setBanksLoading(true)
    setBanksError("")
    fetch("/api/vendor/banks", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.data != null) {
          const raw = data.data.data
          setBanks(Array.isArray(raw) ? raw : [raw])
        } else {
          setBanksError(data?.error?.message ?? data?.error ?? "Failed to load banks")
        }
      })
      .catch(() => setBanksError("Failed to load banks"))
      .finally(() => setBanksLoading(false))
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <TrendingUp className="w-5 h-5" />
          Performance Metrics
        </h3>
        <button
          type="button"
          onClick={() => setWithdrawalBankModalOpen(true)}
          className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Add withdrawal bank
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Wallet Balance</span>
          <span className="font-medium dark:text-white">
            {walletLoading ? (
              <span className="text-gray-400 dark:text-gray-500">Loading...</span>
            ) : walletError ? (
              <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
            ) : (
              currencyFormatter.format(wallet?.balance || 0)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
          <span className="font-medium dark:text-white">
            {walletLoading ? (
              <span className="text-gray-400 dark:text-gray-500">Loading...</span>
            ) : walletError ? (
              <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
            ) : (
              currencyFormatter.format(wallet?.totalEarnings || 0)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Withdrawals</span>
          <span className="font-medium text-yellow-600 dark:text-yellow-400">
            {walletLoading ? (
              <span className="text-gray-400 dark:text-gray-500">Loading...</span>
            ) : walletError ? (
              <span className="text-red-500 dark:text-red-400 text-sm">Error</span>
            ) : (
              currencyFormatter.format(wallet?.totalWithdrawals || 0)
            )}
          </span>
        </div>
      </div>

      {/* Vendor bank details */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Withdrawal bank
        </h4>
        {banksLoading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
        ) : banksError ? (
          <p className="text-sm text-red-500 dark:text-red-400">{banksError}</p>
        ) : banks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No bank account added yet.</p>
        ) : (
          <ul className="space-y-3">
            {banks.map((bank) => (
              <li
                key={bank.id}
                className="text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-100 dark:border-gray-800"
              >
                <div className="font-medium dark:text-white">{bank.bankName}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                  {bank.accountNumber} · {bank.accountName}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddWithdrawalBankModal
        open={withdrawalBankModalOpen}
        onClose={() => setWithdrawalBankModalOpen(false)}
        onSubmit={() => fetchBanks()}
      />
    </div>
  )
}
