"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import AddWithdrawalBankModal from "./AddWithdrawalBankModal"

interface Wallet {
  balance: number
  currency: string
  pendingWithdrawals: number
  availableBalance: number
  totalEarnings: number
  totalWithdrawals: number
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

      <AddWithdrawalBankModal
        open={withdrawalBankModalOpen}
        onClose={() => setWithdrawalBankModalOpen(false)}
      />
    </div>
  )
}
