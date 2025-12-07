"use client"

import { useState, useMemo, useEffect } from "react"
import ProductForm from "@/components/ProductForm"
import EventsTab from "@/components/events/EventsTab"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Users,
  Gift,
  Star,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  X,
  Calendar,
  MapPin,
  Ticket,
  History,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "./ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation";
import { useToast } from "../components/ui/use-toast";
import { config } from "../config"
import { useVendorAuth } from "../contexts/VendorAuthContext"


// Define Product type (for display)
interface Product {
  id: string | number
  name: string
  category: string
  price: number
  stock: number
  status: "active" | "out_of_stock" | "inactive"
  image: string
  images?: string[] // Store all images for editing
  sales: number
  rating: number
  giftCategory: string
  description?: string
}

// Define Backend Product type (from API)
interface BackendProduct {
  _id?: string
  id?: string
  name: string
  category: string
  price: number
  stock: number
  images?: string[]
  description?: string
  vendorId?: string
  createdAt?: string
  updatedAt?: string
}

interface EventItem {
  id: number
  backendId?: string
  title: string
  category: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  attendees: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  image: string
  description?: string
}

// Define Order type
interface Order {
  id: string
  customer: string
  product: string
  quantity: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  date: string
  giftMessage: string
  recipientName: string
  deliveryDate: string
}

// Define NewProduct type (for the form)
interface NewProduct {
  name: string
  category: string
  price: string
  stock: string
  description: string
  giftCategory: string
  image: string
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

// Define DashboardStats type
interface DashboardStats {
  totalProducts: number
  activeOrders: number
  monthlyRevenue: number
  totalCustomers: number
  pendingOrders: number
  completedOrders: number
  avgRating: number
}

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

export default function DashBoard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const router = useRouter();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { toast } = useToast();
  const { logout } = useVendorAuth();

  const handleLogout = async () => {
    console.log('🟡 DASHBOARD handleLogout - Button clicked!');
    
    toast({
      title: "✅ Logged Out Successfully",
      description: "You have been signed out of your account.",
      variant: "success",
    });
    
    console.log('🟡 DASHBOARD - About to call logout() from context...');
    // Call the logout function from VendorAuthContext
    await logout();
  };


  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(true)
  const [profileError, setProfileError] = useState<string>("")

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 45,
    activeOrders: 23,
    monthlyRevenue: 0,
    totalCustomers: 189,
    pendingOrders: 8,
    completedOrders: 234,
    avgRating: 4.8,
  })

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletLoading, setWalletLoading] = useState<boolean>(true)
  const [walletError, setWalletError] = useState<string>("")

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true)
  const [transactionsError, setTransactionsError] = useState<string>("")

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const [productsError, setProductsError] = useState<string>("")

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [])

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
        
        // Update dashboard stats with wallet data
        setDashboardStats(prev => ({
          ...prev,
          monthlyRevenue: walletData.totalEarnings || 0,
        }))
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

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError("")
      
      const response = await fetch('/api/products')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      // Handle different API response formats
      let productsData = data
      if (data.data) {
        productsData = Array.isArray(data.data) ? data.data : data.data.products || []
      } else if (!Array.isArray(data)) {
        productsData = []
      }

      // Transform backend products to display format
      const transformedProducts: Product[] = (Array.isArray(productsData) ? productsData : []).map((product: BackendProduct) => {
        // Determine status based on stock
        let status: "active" | "out_of_stock" | "inactive" = "active"
        if (product.stock === 0) {
          status = "out_of_stock"
        } else if (product.stock < 0) {
          status = "inactive"
        }

        // Get first image or use default emoji based on category
        const getDefaultImage = (category: string): string => {
          const categoryImages: Record<string, string> = {
            "Gift Sets": "🎁",
            "Food & Treats": "🍫",
            "Personalized": "🖼️",
            "Electronics": "📱",
            "Clothing": "👕",
            "Home & Living": "🏠",
            "Books": "📚",
            "Toys": "🧸",
          }
          return categoryImages[category] || "🎁"
        }

        const imageUrl = product.images && product.images.length > 0 
          ? product.images[0] 
          : getDefaultImage(product.category)

        return {
          id: product._id || product.id || "",
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock || 0,
          status: status,
          image: imageUrl,
          images: product.images || [], // Store all images for editing
          sales: 0, // Default value - can be updated if backend provides this
          rating: 0, // Default value - can be updated if backend provides this
          giftCategory: product.category, // Using category as giftCategory for now
          description: product.description,
        }
      })

      setProducts(transformedProducts)
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  const [orders] = useState<Order[]>([
    {
      id: "ORD-001",
      customer: "John Smith",
      product: "Luxury Gift Box Set",
      quantity: 2,
      total: 16000.0,
      status: "pending",
      date: "2025-08-19",
      giftMessage: "Happy Birthday! Hope you love this special gift.",
      recipientName: "Sarah Johnson",
      deliveryDate: "2025-08-22",
    },
    {
      id: "ORD-002",
      customer: "Emily Davis",
      product: "Artisan Chocolate Collection",
      quantity: 1,
      total: 3400.0,
      status: "processing",
      date: "2025-08-18",
      giftMessage: "Congratulations on your promotion!",
      recipientName: "Mike Wilson",
      deliveryDate: "2025-08-21",
    },
    {
      id: "ORD-003",
      customer: "Michael Brown",
      product: "Premium Wine & Cheese Set",
      quantity: 1,
      total: 10000.0,
      status: "shipped",
      date: "2025-08-17",
      giftMessage: "Thank you for all your hard work this year.",
      recipientName: "Corporate Team",
      deliveryDate: "2025-08-20",
    },
  ])

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    giftCategory: "",
    image: "",
  })

  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState<boolean>(false)
  const [eventsError, setEventsError] = useState<string>("")

  const [eventSearchTerm, setEventSearchTerm] = useState("")
  const [eventFilterStatus, setEventFilterStatus] = useState<EventItem["status"] | "all">("all")

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), [])
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

  const categories = ["Gift Sets", "Food & Treats", "Personalized", "Electronics", "Home & Garden", "Fashion"]
  const giftCategories = ["Birthday", "Anniversary", "Wedding", "Corporate", "Holiday", "Thank You"]
  const eventCategories = [
    "Pop-up Shop",
    "Workshop",
    "Launch Event",
    "Virtual Experience",
    "Corporate Showcase",
    "Seasonal Campaign",
  ]
  // eventStatuses moved to EventsTab component

  const getStatusColor = (status: Product["status"] | Order["status"] | EventItem["status"]): string => {
    switch (status) {
      case "upcoming":
        return "text-blue-600 bg-blue-100"
      case "ongoing":
        return "text-purple-600 bg-purple-100"
      case "completed":
        return "text-green-600 bg-green-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      case "active":
      case "delivered":
        return "text-green-600 bg-green-100"
      case "out_of_stock":
        return "text-red-600 bg-red-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "processing":
        return "text-blue-600 bg-blue-100"
      case "shipped":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "processing":
        return <Package className="w-4 h-4" />
      case "shipped":
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      const product: Product = {
        id: Date.now(),
        ...newProduct,
        price: Number.parseFloat(newProduct.price),
        stock: Number.parseInt(newProduct.stock),
        status: "active",
        image: "🎁",
        sales: 0,
        rating: 0,
      }
      setProducts([...products, product])
      setNewProduct({ name: "", category: "", price: "", stock: "", description: "", giftCategory: "", image: "" })
      setShowAddProduct(false)
    }
  }


  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    if (!id) {
      toast({
        title: "Delete failed",
        description: "Product ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/productId?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete product')
      }

      // Refresh products list after deletion
      await fetchProducts()
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : 'Failed to delete product',
        variant: "destructive",
      })
    }
  }






  const handleDeleteEvent = async (event: EventItem) => {
    const eventId = String(event.backendId || event.id)
    try {
      setEventsLoading(true)
      setEventsError("")
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to delete event" }))
        throw new Error(errorData.error?.message || errorData.message || errorData.error || "Failed to delete event")
      }
      setEvents((prev) => prev.filter((e) => String(e.backendId || e.id) !== eventId))
      toast({
        title: "Event deleted",
        description: `"${event.title}" was removed successfully.`,
        variant: "success",
      })
    } catch (err: any) {
      setEventsError(err?.message || "Failed to delete event")
      toast({
        title: "Delete failed",
        description: err?.message || "Unable to delete event",
        variant: "destructive",
      })
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    const computeStatus = (startIso?: string, endIso?: string): EventItem["status"] => {
      if (!startIso) return "upcoming"
      const now = new Date()
      const start = new Date(startIso)
      const end = endIso ? new Date(endIso) : undefined
      if (end && now > end) return "completed"
      if (now >= start && (!end || now <= end)) return "ongoing"
      return "upcoming"
    }

    const toDate = (iso?: string) => {
      if (!iso) return { date: "", time: "" }
      const d = new Date(iso)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      const hh = String(d.getHours()).padStart(2, "0")
      const mi = String(d.getMinutes()).padStart(2, "0")
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` }
    }

    const fetchEvents = async () => {
      try {
        setEventsLoading(true)
        setEventsError("")
        const res = await fetch('/api/events', {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to load events" }))
          throw new Error(errorData.error?.message || errorData.message || errorData.error || "Failed to load events")
        }
        const json = await res.json()
        // Normalize events array from various possible shapes
        const apiEvents =
          json?.data?.data?.events ||
          json?.data?.events ||
          json?.events ||
          (Array.isArray(json) ? json : [])

        const mapped: EventItem[] = apiEvents.map((e: any) => {
          const { date, time } = toDate(e.startAt)
          const status = computeStatus(e.startAt, e.endAt)
          const tiers = Array.isArray(e.tiers) ? e.tiers : []
          const minPrice = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.price || 0))) : 0
          const totalCapacity = tiers.length ? tiers.reduce((s: number, t: any) => s + Number(t.capacity || 0), 0) : 0
          const location =
            e?.location?.venue ||
            e?.location?.address ||
            [e?.location?.city, e?.location?.state].filter(Boolean).join(", ") ||
            "TBA"
          return {
            id: Number(e.id || e._id ? undefined : Date.now() + Math.random() * 1000) || Date.now(),
            backendId: String(e._id || e.id || ""),
            title: e.name || "Untitled Event",
            category: e.category || "other",
            date,
            time,
            location,
            price: minPrice,
            capacity: Number(e.totalCapacity ?? totalCapacity ?? 0),
            attendees: Number(e.totalSold ?? e.attendees ?? 0),
            status,
            image: e.emoji || "🎉",
            description: e.description || "",
          }
        })
        setEvents(mapped)
      } catch (err: any) {
        setEventsError(err?.message || "Failed to load events")
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || product.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, filterCategory])

  // Event computed values moved to EventsTab component

  const DashboardTab = () => (
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

  const ProductsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Gift Products</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {productsLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {productsError && !productsLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error loading products</p>
          <p className="text-sm">{productsError}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!productsLoading && !productsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No products found</p>
              <p className="text-gray-500 text-sm mt-2">Add your first product to get started</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">
                  {product.image.startsWith('http') ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      {/* <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = 'none'
                        }}
                      /> */}
                    </div>
                  ) : (
                    <span>{product.image}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                      setShowEditProduct(true)
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">{product.category}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <span>Stock: {product.stock}</span>
                <span>Sales: {product.sales}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {currencyFormatter.format(product.price)}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.giftCategory}</span>
              </div>
            </div>
          </div>
            ))
          )}
        </div>
      )}
    </div>
  )

  // EventsTab component moved to components/events/EventsTab.tsx

  const OrdersTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gift Orders</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gift Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.customer}</div>
                      <div className="text-xs text-gray-400">{order.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.product}</div>
                      <div className="text-sm text-gray-500">Quantity: {order.quantity}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-sm">To: {order.recipientName}</div>
                      <div className="text-xs text-gray-500">Delivery: {order.deliveryDate}</div>
                      <div className="text-xs text-gray-400 italic mt-1 max-w-xs truncate">{order.giftMessage}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lg">{currencyFormatter.format(order.total)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )


  
  const LogOut = () => {
  return (
    <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">Are you sure you want to logout?</h2>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setShowLogoutPopup(false)}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};







  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowLogoutPopup(true)}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <nav className="flex min-w-max space-x-4 sm:space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "products", label: "Products", icon: Package },
              { id: "events", label: "Events", icon: Calendar },
              { id: "orders", label: "Orders", icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "events" && (
          <EventsTab
            events={events}
            eventsLoading={eventsLoading}
            eventsError={eventsError}
            eventSearchTerm={eventSearchTerm}
            setEventSearchTerm={setEventSearchTerm}
            eventFilterStatus={eventFilterStatus}
            setEventFilterStatus={setEventFilterStatus}
            handleDeleteEvent={handleDeleteEvent}
          />
        )}
        {activeTab === "orders" && <OrdersTab />}
      </main>

      {/* Modals */}
      {showAddProduct && (
        <ProductForm 
          onclose={() => {
            setShowAddProduct(false)
            fetchProducts() // Refresh products after closing
          }} 
          isEdit={false}
        />
      )}
      {showEditProduct && selectedProduct && (
        <ProductForm 
          product={{
            id: selectedProduct.id.toString(),
            name: selectedProduct.name,
            description: selectedProduct.description || '',
            price: selectedProduct.price,
            category: selectedProduct.category,
            stock: selectedProduct.stock,
            // Pass all images as comma-separated string, or single image if no array
            images: selectedProduct.images && selectedProduct.images.length > 0
              ? selectedProduct.images.join(',')
              : (selectedProduct.image.startsWith('http') ? selectedProduct.image : ''),
          }}
          onclose={() => {
            setShowEditProduct(false)
            setSelectedProduct(null)
            fetchProducts() // Refresh products after closing
          }} 
          isEdit={true}
        />
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && <LogOut />}
    </div>
  )
}
