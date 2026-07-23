"use client"

import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Transaction {
  _id: string
  wallet: string
  vendor: string
  type: "credit" | "debit"
  category: string
  amount: number
  currency: string
  balanceBefore: number
  balanceAfter: number
  status: string
  description: string
  processedAt: string
  createdAt: string
  updatedAt: string
  reference: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading: boolean
  error: string
  currentPage: number
  limit: number
  totalPages: number
  totalTransactions: number
  onPageChange: (page: number) => void
  onRetry: () => void
  currencyFormatter: Intl.NumberFormat
}

export default function RecentTransactions({
  transactions,
  loading,
  error,
  currentPage,
  limit,
  totalPages,
  totalTransactions,
  onPageChange,
  onRetry,
  currencyFormatter,
}: RecentTransactionsProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border dark:border-border">
      <div className="p-6 border-b dark:border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <History className="w-5 h-5" />
          Recent Transactions
        </h3>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
            <p className="mt-2 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold">Error loading transactions</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
             <Button
              variant="link"
              size="sm"
              onClick={onRetry}
              className="mt-4 h-auto p-0 text-sm"
            >
              Try again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Description
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Balance
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border">
              {transactions.map((transaction) => {
                const date = new Date(transaction.processedAt || transaction.createdAt)
                const formattedDate = date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                return (
                  <tr
                    key={transaction._id}
                    className="hover:bg-muted dark:hover:bg-muted"
                  >
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === "credit" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`font-medium capitalize ${
                            transaction.type === "credit"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="font-medium dark:text-white">
                        {transaction.description || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.reference}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium capitalize">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span
                        className={`font-bold ${
                          transaction.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="font-medium dark:text-white">
                        {currencyFormatter.format(transaction.balanceAfter)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        From {currencyFormatter.format(transaction.balanceBefore)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-muted-foreground">
                      {formattedDate}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "text-green-600 bg-green-100"
                            : transaction.status === "pending"
                              ? "text-yellow-600 bg-yellow-100"
                              : "text-red-600 bg-red-100"
                        }`}
                      >
                        {transaction.status === "completed" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {transaction.status === "pending" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {transaction.status !== "completed" &&
                          transaction.status !== "pending" && (
                            <XCircle className="w-3 h-3" />
                          )}
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {!loading && !error && transactions.length > 0 && (totalPages > 1 || transactions.length >= limit) && (
        <div className="px-6 py-4 border-t dark:border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalTransactions)} of {totalTransactions}{" "}
            transactions
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
