"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Wallet,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Megaphone,
  Package,
  Box,
} from "lucide-react"
import { redirectToLogin } from "@/lib/authRedirect"
import FundWalletModal from "./FundWalletModal"
import PerformanceMetricsCard from "./PerformanceMetricsCard"
import RecentTransactions from "./RecentTransactions"
import type { Transaction } from "./RecentTransactions"
import VendorProfileCard from "./VendorProfileCard"
import WithdrawModal from "./WithdrawModal"

// Define Wallet type
interface Wallet {
  balance: number
  currency: string
  pendingWithdrawals: number
  availableBalance: number
  totalEarnings: number
  totalWithdrawals: number
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
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false)
  
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
      buttonLabel: 'Fund Wallet',
      buttonAction: 'fund' as const,
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
      hasButton: true,
      buttonLabel: 'Withdraw',
      buttonAction: 'withdraw' as const,
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
                      onClick={() => card.buttonAction === 'withdraw' ? setWithdrawModalOpen(true) : setFundWalletModalOpen(true)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {card.buttonLabel}
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
                          onClick={() => card.buttonAction === 'withdraw' ? setWithdrawModalOpen(true) : setFundWalletModalOpen(true)}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {card.buttonLabel}
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
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentSlide < statsCards.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-10"
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

      {/* Product Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            id: 'events',
            label: 'Events',
            icon: Calendar,
            gradient: 'from-indigo-500 to-indigo-600',
            accent: 'text-indigo-100',
            iconColor: 'text-indigo-200',
          },
          {
            id: 'ads',
            label: 'Ads',
            icon: Megaphone,
            gradient: 'from-purple-500 to-purple-600',
            accent: 'text-purple-100',
            iconColor: 'text-purple-200',
          },
          {
            id: 'inventory',
            label: 'Inventory',
            icon: Box,
            gradient: 'from-blue-500 to-blue-600',
            accent: 'text-blue-100',
            iconColor: 'text-blue-200',
          },
          {
            id: 'products',
            label: 'Products',
            icon: Package,
            gradient: 'from-green-500 to-green-600',
            accent: 'text-green-100',
            iconColor: 'text-green-200',
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <Icon className={`w-12 h-12 ${card.iconColor} mb-3`} />
                <p className={`${card.accent} text-lg font-semibold`}>{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <RecentTransactions
        transactions={transactions}
        loading={transactionsLoading}
        error={transactionsError}
        currentPage={currentPage}
        limit={limit}
        totalPages={totalPages}
        totalTransactions={totalTransactions}
        onPageChange={setCurrentPage}
        onRetry={() => fetchTransactions(currentPage)}
        currencyFormatter={currencyFormatter}
      />

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetricsCard
          wallet={wallet}
          walletLoading={walletLoading}
          walletError={walletError}
          currencyFormatter={currencyFormatter}
        />
        <VendorProfileCard
          profile={vendorProfile}
          loading={profileLoading}
          error={profileError}
          onRetry={fetchProfile}
        />
      </div>

      <FundWalletModal
        open={fundWalletModalOpen}
        onClose={() => setFundWalletModalOpen(false)}
        vendorEmail={vendorProfile?.email}
      />

      <WithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={fetchWallet}
      />
    </div>
  )
}

