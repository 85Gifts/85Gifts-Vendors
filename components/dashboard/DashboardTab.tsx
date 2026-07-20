"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import FundWalletModal from "./FundWalletModal"
import PerformanceMetricsCard from "./PerformanceMetricsCard"
import RecentTransactions from "./RecentTransactions"
import type { Transaction } from "./RecentTransactions"
import VendorProfileCard from "./VendorProfileCard"
import WithdrawModal from "./WithdrawModal"
import EarningsChart from "./EarningsChart"

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

// Defensive extraction of a list array from the inconsistent nested API shapes.
function extractArray(data: any, key: string): any[] {
  const candidate =
    data?.data?.data?.[key] ??
    data?.data?.[key] ??
    data?.[key] ??
    data?.data?.data ??
    data?.data ??
    data
  return Array.isArray(candidate) ? candidate : []
}

// Prefer an explicit total (pagination) when present, else fall back to array length.
function extractTotal(data: any, array: any[]): number {
  const total =
    data?.data?.data?.pagination?.total ??
    data?.data?.pagination?.total ??
    data?.pagination?.total
  return typeof total === "number" ? total : array.length
}

export default function DashboardTab() {
  const router = useRouter()
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

  // Live counts for the dashboard quick-stat tiles
  const [counts, setCounts] = useState<{
    events: number
    products: number
    ads: number
    inventory: number
  }>({ events: 0, products: 0, ads: 0, inventory: 0 })
  const [countsLoading, setCountsLoading] = useState<boolean>(true)
  
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
      label: 'Available Balance',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.availableBalance || 0),
      icon: Wallet,
      hasButton: true,
      buttonLabel: 'Fund Wallet',
      buttonAction: 'fund' as const,
    },
    {
      id: 'total-earnings',
      label: 'Total Earnings',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.totalEarnings || 0),
      icon: Wallet,
      hasButton: true,
      buttonLabel: 'Withdraw',
      buttonAction: 'withdraw' as const,
    },
    {
      id: 'total-withdrawals',
      label: 'Total Withdrawals',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.totalWithdrawals || 0),
      icon: Wallet,
      hasButton: false,
    },
    {
      id: 'pending-withdrawals',
      label: 'Pending Withdrawals',
      value: walletLoading ? 'Loading...' : walletError ? 'Error' : currencyFormatter.format(wallet?.pendingWithdrawals || 0),
      icon: Clock,
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

  // Fetch live counts for the quick-stat tiles (events, products, ads, inventory)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setCountsLoading(true)
      const next = { events: 0, products: 0, ads: 0, inventory: 0 }

      const safe = async (url: string) => {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          })
          if (!res.ok) return null
          return await res.json().catch(() => null)
        } catch {
          return null
        }
      }

      const [eventsData, productsData, adsData, inventoryData] = await Promise.all([
        safe("/api/events"),
        safe("/api/products"),
        safe("/api/ads/campaigns"),
        safe("/api/inventory/products"),
      ])

      if (cancelled) return

      const events = extractArray(eventsData, "events")
      next.events = extractTotal(eventsData, events)

      const products = extractArray(productsData, "products")
      next.products = extractTotal(productsData, products)

      const campaigns = extractArray(adsData, "campaigns")
      next.ads = campaigns.filter(
        (c: any) => (c?.status || "").toLowerCase() === "active"
      ).length

      const inventory = extractArray(inventoryData, "products")
      next.inventory = extractTotal(inventoryData, inventory)

      setCounts(next)
      setCountsLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
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
              <CardSpotlight
                key={card.id}
                className="p-6"
                spotColor="rgba(85, 110, 230, 0.18)"
              >
                <div className={`flex items-start justify-between ${card.hasButton ? 'mb-4' : ''}`}>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold tabular-nums">
                      {walletLoading ? (
                        <span className="text-muted-foreground">{card.value}</span>
                      ) : walletError ? (
                        <span className="text-destructive">Error</span>
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                  <span className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                    <Icon className="w-6 h-6 text-primary" />
                  </span>
                </div>
                {card.hasButton && (
                  <div className="flex gap-2">
                    <Button
                      variant={card.buttonAction === 'withdraw' ? 'warning' : 'success'}
                      size="sm"
                      onClick={() => card.buttonAction === 'withdraw' ? setWithdrawModalOpen(true) : setFundWalletModalOpen(true)}
                    >
                      {card.buttonLabel}
                    </Button>
                  </div>
                )}
              </CardSpotlight>
            )
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative -mx-4 px-4">
          <div
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {statsCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="min-w-full snap-center"
                >
                  <CardSpotlight
                    className="p-6 h-full min-h-[160px] flex flex-col justify-between"
                    spotColor="rgba(85, 110, 230, 0.18)"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {card.label}
                        </p>
                        <p className="text-3xl font-bold tabular-nums">
                          {walletLoading ? (
                            <span className="text-muted-foreground">{card.value}</span>
                          ) : walletError ? (
                            <span className="text-destructive">Error</span>
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>
                      <span className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                        <Icon className="w-6 h-6 text-primary" />
                      </span>
                    </div>
                    <div className="flex gap-2 h-[32px]">
                      {card.hasButton ? (
                        <Button
                          variant={card.buttonAction === 'withdraw' ? 'warning' : 'success'}
                          size="sm"
                          onClick={() => card.buttonAction === 'withdraw' ? setWithdrawModalOpen(true) : setFundWalletModalOpen(true)}
                        >
                          {card.buttonLabel}
                        </Button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </CardSpotlight>
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows */}
          {currentSlide > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          {currentSlide < statsCards.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {statsCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-primary w-8'
                    : 'bg-muted w-2'
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
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'ads', label: 'Ads', icon: Megaphone },
          { id: 'inventory', label: 'Inventory', icon: Box },
          { id: 'products', label: 'Products', icon: Package },
        ].map((card) => {
          const Icon = card.icon
          const handleClick = () => {
            const routes: Record<string, string> = {
              events: "/dashboard/events",
              ads: "/dashboard/ads",
              inventory: "/inventory",
              products: "/dashboard/products",
            }
            const route = routes[card.id]
            if (route) {
              router.push(route)
            }
          }
          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleClick()
                }
              }}
              className="group relative cursor-pointer rounded-xl bg-card p-[1.5px] text-foreground transition-transform hover:-translate-y-1"
            >
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/60 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col items-center justify-center rounded-[10px] bg-card p-4 sm:p-6 text-center">
                <span className="mb-3 flex items-center justify-center rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <Icon className="w-9 h-9 text-primary" />
                </span>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {countsLoading ? "–" : counts[card.id as keyof typeof counts].toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{card.label}</p>
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

      <EarningsChart transactions={transactions} />

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetricsCard
          wallet={wallet}
          walletLoading={walletLoading}
          walletError={walletError}
          currencyFormatter={currencyFormatter}
          transactions={transactions}
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

