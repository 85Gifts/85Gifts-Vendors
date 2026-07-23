"use client"

import { useState, useEffect, useMemo } from "react"
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { redirectToLogin } from "@/lib/authRedirect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const typeBadgeClass = (type: string) =>
  type === "credit"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    default:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  }
}

// Define Transaction type
interface Transaction {
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

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true)
  const [transactionsError, setTransactionsError] = useState<string>("")
  
  // Pagination state - 20 per page
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit] = useState<number>(20)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
        currencyDisplay: "narrowSymbol",
      }),
    []
  )

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  const fetchTransactions = async (page: number = 1, filters?: {
    type?: string
    category?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    try {
      setTransactionsLoading(true)
      setTransactionsError("")
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      
      const response = await fetch(`/api/vendor/wallet/transactions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const responseData = await response.json().catch(() => ({}))

      if (response.status === 401) {
        redirectToLogin()
        return
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to fetch transactions')
      }

      // Handle the nested response structure: { success: true, data: { message: "...", data: [...], pagination: {...} } }
      const transactionsData = responseData?.data?.data || responseData?.data || []
      const paginationData = responseData?.data?.pagination || responseData?.pagination
      
      if (Array.isArray(transactionsData) && responseData.success !== false) {
        setTransactions(transactionsData)
        
        // Update pagination state
        if (paginationData) {
          const total = paginationData.total || paginationData.count || 0
          // Check for different possible pagination field names: pages, totalPages, total_pages
          const totalPagesFromAPI = paginationData.pages || paginationData.totalPages || paginationData.total_pages
          
          // Calculate totalPages if not provided but we have total
          const calculatedTotalPages = totalPagesFromAPI || (total > 0 ? Math.ceil(total / limit) : 1)
          
          setTotalPages(calculatedTotalPages)
          setTotalTransactions(total)
        } else {
          // Fallback: if we have exactly the limit number of transactions, assume there might be more pages
          if (transactionsData.length >= limit) {
            setTotalPages(2)
            setTotalTransactions(transactionsData.length)
          } else {
            setTotalPages(1)
            setTotalTransactions(transactionsData.length)
          }
        }
      } else {
        setTransactions([])
        setTotalPages(1)
        setTotalTransactions(0)
      }
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to fetch transactions')
      console.error('Error fetching transactions:', err)
      setTransactions([])
    } finally {
      setTransactionsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Transactions</h2>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl shadow-sm border dark:border-border">
        <div className="p-6 border-b dark:border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
            <History className="w-5 h-5" />
            Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-2 text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">Error loading transactions</p>
              <p className="text-sm text-muted-foreground mt-1">{transactionsError}</p>
              <button
                onClick={() => fetchTransactions(currentPage)}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const date = new Date(transaction.processedAt || transaction.createdAt)
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  return (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'credit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                          <Badge className={typeBadgeClass(transaction.type)}>{transaction.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium dark:text-white">{transaction.description || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{transaction.reference}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {currencyFormatter.format(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium dark:text-white">{currencyFormatter.format(transaction.balanceAfter)}</div>
                        <div className="text-xs text-muted-foreground">From {currencyFormatter.format(transaction.balanceBefore)}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formattedDate}
                      </TableCell>
                      <TableCell>
                        <Badge className={`gap-1 ${statusBadgeClass(transaction.status)}`}>
                          {transaction.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
                          {transaction.status !== 'completed' && transaction.status !== 'pending' && <XCircle className="w-3 h-3" />}
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
        {/* Pagination Controls */}
        {!transactionsLoading && !transactionsError && transactions.length > 0 && (totalPages > 1 || transactions.length >= limit) && (
          <div className="px-6 py-4 border-t dark:border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalTransactions)} of {totalTransactions} transactions
            </div>
             <div className="flex items-center gap-2">
               <Button
                 variant="outline"
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
               >
                 Previous
               </Button>
               <div className="flex items-center gap-1">
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                   let pageNum;
                   if (totalPages <= 5) {
                     pageNum = i + 1;
                   } else if (currentPage <= 3) {
                     pageNum = i + 1;
                   } else if (currentPage >= totalPages - 2) {
                     pageNum = totalPages - 4 + i;
                   } else {
                     pageNum = currentPage - 2 + i;
                   }
                   
                   return (
                     <Button
                       key={pageNum}
                       variant={currentPage === pageNum ? "default" : "outline"}
                       onClick={() => setCurrentPage(pageNum)}
                     >
                       {pageNum}
                     </Button>
                   );
                 })}
               </div>
               <Button
                 variant="outline"
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
               >
                 Next
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
