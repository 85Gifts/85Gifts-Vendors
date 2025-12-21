"use client"

import { useState, useMemo, useEffect } from "react"
import ProductForm from "@/components/ProductForm"
import EventsTab from "@/components/events/EventsTab"
import AdsTab from "@/components/ads/AdsTab"
import DashboardTab from "@/components/dashboard/DashboardTab"
import ProductsTab from "@/components/products/ProductsTab"
import {
  Package,
  Eye,
  Edit,
  ShoppingBag,
  TrendingUp,
  Users,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Megaphone,
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

  const getStatusColor = (status: Order["status"] | EventItem["status"]): string => {
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

  // Event computed values moved to EventsTab component
  // ProductsTab component moved to components/products/ProductsTab.tsx

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
              { id: "ads", label: "Ads", icon: Megaphone },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "events", label: "Events", icon: Calendar },
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
        {activeTab === "orders" && <OrdersTab />}
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
