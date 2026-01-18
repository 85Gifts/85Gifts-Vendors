"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Wallet,
  TrendingUp,
  History,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { redirectToLogin } from "@/lib/authRedirect"

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(true)
  const [profileError, setProfileError] = useState<string>("")

  const [fundWalletModalOpen, setFundWalletModalOpen] = useState<boolean>(false)
  const [fundAmount, setFundAmount] = useState<string>("")
  const [fundingLoading, setFundingLoading] = useState<boolean>(false)
  
  // Carousel state for mobile
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
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

  const statsCards = useMemo(() => [
    {
      id: 'available-balance',
      gradient: 'from-purple-500 to-purple-600',
      label: 'Available Balance',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.availableBalance || 0),
      icon: Wallet,
      iconColor: 'text-purple-200',
      errorColor: 'text-red-200',
      loadingColor: 'text-purple-200',
      hasButton: true,
    },
    {
      id: 'total-earnings',
      gradient: 'from-green-500 to-green-600',
      label: 'Total Earnings',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.totalEarnings || 0),
      icon: Wallet,
      iconColor: 'text-green-200',
      errorColor: 'text-red-200',
      loadingColor: 'text-green-200',
      hasButton: false,
    },
    {
      id: 'total-withdrawals',
      gradient: 'from-blue-500 to-blue-600',
      label: 'Total Withdrawals',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.totalWithdrawals || 0),
      icon: Wallet,
      iconColor: 'text-blue-200',
      errorColor: 'text-red-200',
      loadingColor: 'text-blue-200',
      hasButton: false,
    },
    {
      id: 'pending-withdrawals',
      gradient: 'from-orange-500 to-orange-600',
      label: 'Pending Withdrawals',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.pendingWithdrawals || 0),
      icon: Clock,
      iconColor: 'text-orange-200',
      errorColor: 'text-red-200',
      loadingColor: 'text-orange-200',
      hasButton: false,
    },
  ], [currencyFormatter, wallet, walletLoading, walletError])

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50
    
    if (distance > minSwipeDistance && currentSlide < statsCards.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else if (distance < -minSwipeDistance && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }
  
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentSlide * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
  }, [currentSlide, statsCards.length])
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  
  const nextSlide = () => {
    if (currentSlide < statsCards.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Fetch wallet data from backend
  useEffect(() => {
    fetchWallet()
  }, [])

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

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

      const data = await response.json().catch(() => ({}))

      if (response.status === 401) {
        redirectToLogin()
        return
      }

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
      
      // Debug: log the response structure to help troubleshoot
      console.log('Transactions API Response:', {
        hasData: !!responseData?.data,
        hasPagination: !!paginationData,
        transactionsCount: Array.isArray(transactionsData) ? transactionsData.length : 0,
        paginationData,
        fullResponse: responseData
      })
      
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
          // This handles cases where pagination data might not be returned
          if (transactionsData.length >= limit) {
            // If we got a full page, there's likely at least one more page
            // Set to 2 as minimum, but this will be corrected when user navigates
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

      const responseData = await response.json().catch(() => ({}))

      if (response.status === 401) {
        redirectToLogin()
        return
      }

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

  const handleFundWallet = async () => {
    // Validate amount
    const amount = parseFloat(fundAmount)
    if (!fundAmount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    // Check if email is available
    if (!vendorProfile?.email) {
      alert("Email not found. Please try again later.")
      return
    }

    try {
      setFundingLoading(true)
      
      const response = await fetch('/api/paystack/funding/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: amount,
          email: vendorProfile.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initialize payment')
      }

      // Extract authorization URL from response
      const authorizationUrl = data?.data?.data?.authorizationUrl
      
      if (authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = authorizationUrl
      } else {
        throw new Error('Authorization URL not found in response')
      }
    } catch (err) {
      console.error('Error initializing payment:', err)
      alert(err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.')
      setFundingLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Desktop / Carousel - Mobile */}
      <div className="relative">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.id} className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white`}>
                <div className={`flex items-center justify-between ${card.hasButton ? 'mb-4' : ''}`}>
                  <div>
                    <p className={`${card.gradient.includes('purple') ? 'text-purple-100' : card.gradient.includes('green') ? 'text-green-100' : card.gradient.includes('blue') ? 'text-blue-100' : 'text-orange-100'} text-sm`}>
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold">
                      {walletLoading ? (
                        <span className={card.loadingColor}>{card.value}</span>
                      ) : walletError ? (
                        <span className={card.errorColor}>Error</span>
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${card.iconColor}`} />
                </div>
                {card.hasButton && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFundWalletModalOpen(true)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Fund Wallet
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative -mx-6 px-6">
          <div
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {statsCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="min-w-full snap-center"
                >
                  <div className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white h-full min-h-[160px] flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className={`${card.gradient.includes('purple') ? 'text-purple-100' : card.gradient.includes('green') ? 'text-green-100' : card.gradient.includes('blue') ? 'text-blue-100' : 'text-orange-100'} text-sm`}>
                          {card.label}
                        </p>
                        <p className="text-3xl font-bold">
                          {walletLoading ? (
                            <span className={card.loadingColor}>{card.value}</span>
                          ) : walletError ? (
                            <span className={card.errorColor}>Error</span>
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>
                      <Icon className={`w-8 h-8 ${card.iconColor}`} />
                    </div>
                    <div className="flex gap-2 h-[32px]">
                      {card.hasButton ? (
                        <button 
                          onClick={() => setFundWalletModalOpen(true)}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Fund Wallet
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows */}
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm rounded-full p-2 text-gray-700 transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentSlide < statsCards.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm rounded-full p-2 text-gray-700 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {statsCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <div className="p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
            <History className="w-5 h-5" />
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">Error loading transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{transactionsError}</p>
              <button
                onClick={() => fetchTransactions(currentPage)}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Try again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'credit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                          <span className={`font-medium capitalize ${
                            transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium dark:text-white">{transaction.description || 'N/A'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {currencyFormatter.format(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium dark:text-white">{currencyFormatter.format(transaction.balanceAfter)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">From {currencyFormatter.format(transaction.balanceBefore)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
        {/* Pagination Controls */}
        {!transactionsLoading && !transactionsError && transactions.length > 0 && (totalPages > 1 || transactions.length >= limit) && (
          <div className="px-6 py-4 border-t dark:border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalTransactions)} of {totalTransactions} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </h3>
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
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Vendor Profile</h3>
          {profileLoading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          ) : profileError ? (
            <div className="py-4 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Error loading profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{profileError}</p>
              <button
                onClick={fetchProfile}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Try again
              </button>
            </div>
          ) : vendorProfile ? (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Business Name</span>
                <div className="font-medium dark:text-white">{vendorProfile.businessName || vendorProfile.name}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Contact Name</span>
                <div className="font-medium dark:text-white">{vendorProfile.name}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Email</span>
                <div className="font-medium dark:text-white">{vendorProfile.email}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Phone</span>
                <div className="font-medium dark:text-white">{vendorProfile.phone}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Address</span>
                <div className="font-medium text-sm dark:text-white">{vendorProfile.address}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Member Since</span>
                <div className="font-medium dark:text-white">{vendorProfile.joinDate}</div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">No profile data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {fundWalletModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <h3 className="text-lg font-semibold dark:text-white">Fund Wallet</h3>
              <button
                onClick={() => {
                  if (!fundingLoading) {
                    setFundWalletModalOpen(false)
                    setFundAmount("")
                  }
                }}
                disabled={fundingLoading}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                  step="0.01"
                  disabled={fundingLoading}
                />
              </div>
              <button
                onClick={handleFundWallet}
                disabled={fundingLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {fundingLoading ? "Processing..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

