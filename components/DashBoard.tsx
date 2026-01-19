"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import ProductForm from "@/components/ProductForm"
import EventsTab from "@/components/events/EventsTab"
import AdsTab from "@/components/ads/AdsTab"
import DashboardTab from "@/components/dashboard/DashboardTab"
import ProductsTab from "@/components/products/ProductsTab"
import TransactionsTab from "@/components/transactions/TransactionsTab"
import {
  Package,
  Eye,
  Edit,
  History,
  TrendingUp,
  Users,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Megaphone,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "./ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation";
import { useToast } from "../components/ui/use-toast";
import { config } from "../config"
import { useVendorAuth } from "../contexts/VendorAuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { redirectToLogin } from "@/lib/authRedirect"


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

interface EventItem {
  id: number
  backendId?: string
  slug?: string
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
  approvalStatus?: string
  isApproved?: boolean
  approved?: boolean
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

export default function DashBoard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [refreshProducts, setRefreshProducts] = useState<(() => Promise<void>) | null>(null)
  const router = useRouter();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { toast } = useToast();
  const { logout } = useVendorAuth();
  const { theme, toggleTheme } = useTheme();
  const handleUnauthorized = (response: Response) => {
    if (response.status === 401) {
      redirectToLogin()
      return true
    }
    return false
  }

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


  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 45,
    activeOrders: 23,
    monthlyRevenue: 0,
    totalCustomers: 189,
    pendingOrders: 8,
    completedOrders: 234,
    avgRating: 4.8,
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

  const getStatusColor = (status: EventItem["status"] | "pending" | "processing" | "shipped" | "delivered"): string => {
    switch (status) {
      case "upcoming":
        return "text-blue-600 bg-blue-100"
      case "ongoing":
        return "text-purple-600 bg-purple-100"
      case "completed":
        return "text-green-600 bg-green-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      case "delivered":
        return "text-green-600 bg-green-100"
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

  const getStatusIcon = (status: "pending" | "processing" | "shipped" | "delivered") => {
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



  const handleDeleteProduct = (id: string | number) => {
    // This callback is called after ProductsTab successfully deletes a product
    // Can be used for any additional cleanup or state updates if needed
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
      if (handleUnauthorized(res)) {
        return
      }
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
        if (handleUnauthorized(res)) {
          return
        }
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
          const approvalStatus =
            e?.approvalStatus || e?.approval_status || e?.reviewStatus || e?.status
          return {
            id: Number(e.id || e._id ? undefined : Date.now() + Math.random() * 1000) || Date.now(),
            backendId: String(e._id || e.id || ""),
            slug: e?.slug || e?.linkSlug || e?.eventSlug || undefined,
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
            approvalStatus,
            isApproved:
              typeof e?.isApproved === "boolean"
                ? e.isApproved
                : typeof e?.isPublished === "boolean"
                ? e.isPublished
                : undefined,
            approved: typeof e?.approved === "boolean" ? e.approved : undefined,
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

  // Event computed values moved to EventsTab component
  // ProductsTab component moved to components/products/ProductsTab.tsx

  // EventsTab component moved to components/events/EventsTab.tsx

  const LogOut = () => {
  return (
    <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-30 dark:bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Are you sure you want to logout?</h2>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setShowLogoutPopup(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dsmc6vtpt/image/upload/v1768827902/omniflow_monogram_blue_segmsg.png"
                alt="logo"
                className="h-10"
                width={50}
                height={50}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">OmniFlow85</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <Button onClick={() => setShowLogoutPopup(true)}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <nav className="flex min-w-max space-x-4 sm:space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "products", label: "Products", icon: Package },
              { id: "ads", label: "Ads", icon: Megaphone },
              { id: "transactions", label: "Transactions", icon: History },
              { id: "events", label: "Events", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "inventory") {
                      window.location.href = "/inventory"
                    } else {
                      setActiveTab(tab.id)
                    }
                  }}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
        {activeTab === "products" && (
          <ProductsTab
            onAddProduct={() => setShowAddProduct(true)}
            onEditProduct={(product) => {
              setSelectedProduct(product)
              setShowEditProduct(true)
            }}
            onDeleteProduct={handleDeleteProduct}
            onRefreshRequested={(refreshFn) => setRefreshProducts(() => refreshFn)}
          />
        )}
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
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "ads" && <AdsTab />}
      </main>

      {/* Modals */}
      {showAddProduct && (
        <ProductForm 
          onclose={() => {
            setShowAddProduct(false)
          }}
          onSuccess={async () => {
            // Refresh products list
            if (refreshProducts) {
              await refreshProducts()
            }
            // Show success toast
            toast({
              title: "Product created",
              description: "The product has been successfully created.",
              variant: "success",
            })
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
          }}
          onSuccess={async () => {
            // Refresh products list
            if (refreshProducts) {
              await refreshProducts()
            }
            // Show success toast
            toast({
              title: "Product updated",
              description: "The product has been successfully updated.",
              variant: "success",
            })
          }}
          isEdit={true}
        />
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && <LogOut />}
    </div>
  )
}
