"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Wallet,
  TrendingUp,
  History,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// Define Wallet type
interface Wallet {
  balance: number
  currency: string
  pendingWithdrawals: number
  availableBalance: number
  totalEarnings: number
  totalWithdrawals: number
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

// Define VendorProfile type
interface VendorProfile {
  _id?: string
  name: string
  businessName?: string
  email: string
  phone: string
  address: string
  totalOrders?: number
  joinDate: string
  createdAt?: string
  updatedAt?: string
}

export default function DashboardTab() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletLoading, setWalletLoading] = useState<boolean>(true)
  const [walletError, setWalletError] = useState<string>("")

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true)
  const [transactionsError, setTransactionsError] = useState<string>("")

  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(true)
  const [profileError, setProfileError] = useState<string>("")

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

  // Fetch wallet data from backend
  useEffect(() => {
    fetchWallet()
  }, [])

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions()
  }, [])

  // Fetch vendor profile from backend
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchWallet = async () => {
    try {
      setWalletLoading(true)
      setWalletError("")
      
      const response = await fetch('/api/vendor/wallet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch wallet data')
      }

      // Handle the nested response structure
      const walletData = data?.data?.data || data?.data || data
      
      if (walletData) {
        setWallet({
          balance: walletData.balance || 0,
          currency: walletData.currency || "NGN",
          pendingWithdrawals: walletData.pendingWithdrawals || 0,
          availableBalance: walletData.availableBalance || 0,
          totalEarnings: walletData.totalEarnings || 0,
          totalWithdrawals: walletData.totalWithdrawals || 0,
        })
      }
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Failed to fetch wallet data')
      console.error('Error fetching wallet:', err)
    } finally {
      setWalletLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      setTransactionsError("")
      
      const response = await fetch('/api/vendor/wallet/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to fetch transactions')
      }

      // Handle the nested response structure: { success: true, data: { message: "...", data: [...] } }
      const transactionsData = responseData?.data?.data || responseData?.data || []
      
      if (Array.isArray(transactionsData) && responseData.success !== false) {
        setTransactions(transactionsData)
      } else {
        setTransactions([])
      }
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to fetch transactions')
      console.error('Error fetching transactions:', err)
      setTransactions([])
    } finally {
      setTransactionsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      setProfileError("")
      
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to fetch profile')
      }

      // Handle the nested response structure: { success: true, data: { data: { ... } } }
      const profileData = responseData?.data?.data || responseData?.data || responseData
      
      if (profileData && responseData.success !== false) {
        // Format the joinDate from createdAt
        const joinDate = profileData.createdAt 
          ? new Date(profileData.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            })
          : 'N/A'

        setVendorProfile({
          _id: profileData._id,
          name: profileData.name || '',
          businessName: profileData.businessName,
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          joinDate: joinDate,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        })
      } else {
        throw new Error('Invalid profile data structure')
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">
                {walletLoading ? (
                  <span className="text-purple-200">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-200 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.availableBalance || 0)
                )}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold">
                {walletLoading ? (
                  <span className="text-green-200">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-200 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.totalEarnings || 0)
                )}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Withdrawals</p>
              <p className="text-3xl font-bold">
                {walletLoading ? (
                  <span className="text-blue-200">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-200 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.totalWithdrawals || 0)
                )}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Withdrawals</p>
              <p className="text-3xl font-bold">
                {walletLoading ? (
                  <span className="text-orange-200">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-200 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.pendingWithdrawals || 0)
                )}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 font-semibold">Error loading transactions</p>
              <p className="text-sm text-gray-500 mt-1">{transactionsError}</p>
              <button
                onClick={fetchTransactions}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
              <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.slice(0, 10).map((transaction) => {
                  const date = new Date(transaction.processedAt || transaction.createdAt)
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  return (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'credit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-medium capitalize ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{transaction.description || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{transaction.reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {currencyFormatter.format(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{currencyFormatter.format(transaction.balanceAfter)}</div>
                        <div className="text-xs text-gray-500">From {currencyFormatter.format(transaction.balanceBefore)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'text-green-600 bg-green-100' 
                              : transaction.status === 'pending'
                              ? 'text-yellow-600 bg-yellow-100'
                              : 'text-red-600 bg-red-100'
                          }`}
                        >
                          {transaction.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
                          {transaction.status !== 'completed' && transaction.status !== 'pending' && <XCircle className="w-3 h-3" />}
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
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wallet Balance</span>
              <span className="font-medium">
                {walletLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.balance || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-medium">
                {walletLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.totalEarnings || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Withdrawals</span>
              <span className="font-medium text-yellow-600">
                {walletLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : walletError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  currencyFormatter.format(wallet?.totalWithdrawals || 0)
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor Profile</h3>
          {profileLoading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading profile...</p>
            </div>
          ) : profileError ? (
            <div className="py-4 text-center">
              <p className="text-red-600 text-sm font-semibold">Error loading profile</p>
              <p className="text-xs text-gray-500 mt-1">{profileError}</p>
              <button
                onClick={fetchProfile}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          ) : vendorProfile ? (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Business Name</span>
                <div className="font-medium">{vendorProfile.businessName || vendorProfile.name}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Contact Name</span>
                <div className="font-medium">{vendorProfile.name}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email</span>
                <div className="font-medium">{vendorProfile.email}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Phone</span>
                <div className="font-medium">{vendorProfile.phone}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Address</span>
                <div className="font-medium text-sm">{vendorProfile.address}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Member Since</span>
                <div className="font-medium">{vendorProfile.joinDate}</div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-600 text-sm">No profile data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

