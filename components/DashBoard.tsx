"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { Button } from "./ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation";
import { useToast } from "../components/ui/use-toast";


// Define Product type
interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: "active" | "out_of_stock" | "inactive"
  image: string
  sales: number
  rating: number
  giftCategory: string
  description?: string // Add optional description field
}

interface EventItem {
  id: number
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

interface NewEvent {
  title: string
  category: string
  date: string
  time: string
  location: string
  price: string
  capacity: string
  description: string
  image: string
}

// Define VendorProfile type
interface VendorProfile {
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  joinDate: string
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const router = useRouter();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    Cookies.remove("authToken");
    toast({
            title: "Log Out",
            description: "You have successfully log out.",
            variant: "success",
          });
    router.push("/login");
  };


  // Mock data
  const [vendorProfile] = useState<VendorProfile>({
    name: "85Gifts",
    email: "vendor@elegantgifts.com",
    phone: "+1 (555) 123-4567",
    address: "123 Gift Street, Commerce City, CC 12345",
    totalOrders: 1247,
    joinDate: "Jan 2023",
  })

  const [dashboardStats] = useState<DashboardStats>({
    totalProducts: 45,
    activeOrders: 23,
    monthlyRevenue: 12450,
    totalCustomers: 189,
    pendingOrders: 8,
    completedOrders: 234,
    avgRating: 4.8,
  })

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Luxury Gift Box Set",
      category: "Gift Sets",
      price: 8000.0,
      stock: 25,
      status: "active",
      image: "🎁",
      sales: 156,
      rating: 4.9,
      giftCategory: "Birthday",
    },
    {
      id: 2,
      name: "Artisan Chocolate Collection",
      category: "Food & Treats",
      price: 3400.0,
      stock: 0,
      status: "out_of_stock",
      image: "🍫",
      sales: 203,
      rating: 4.7,
      giftCategory: "Anniversary",
    },
    {
      id: 3,
      name: "Personalized Photo Frame",
      category: "Personalized",
      price: 5000.0,
      stock: 42,
      status: "active",
      image: "🖼️",
      sales: 89,
      rating: 4.6,
      giftCategory: "Wedding",
    },
    {
      id: 4,
      name: "Premium Wine & Cheese Set",
      category: "Food & Treats",
      price: 10000.0,
      stock: 15,
      status: "active",
      image: "🍷",
      sales: 67,
      rating: 4.8,
      giftCategory: "Corporate",
    },
  ])

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

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      title: "Holiday Pop-Up Experience",
      category: "Pop-up Shop",
      date: "2025-12-10",
      time: "14:00",
      location: "Lagos Experience Center",
      price: 15000,
      capacity: 120,
      attendees: 86,
      status: "upcoming",
      image: "🎄",
      description: "Exclusive holiday gift showcase with live customizations and tastings.",
    },
    {
      id: 2,
      title: "Corporate Gifting Workshop",
      category: "Workshop",
      date: "2025-11-18",
      time: "10:30",
      location: "Virtual",
      price: 0,
      capacity: 200,
      attendees: 158,
      status: "ongoing",
      image: "💼",
      description: "Interactive webinar helping teams curate thoughtful corporate gifting bundles.",
    },
    {
      id: 3,
      title: "Valentine Launch Party",
      category: "Launch Event",
      date: "2025-02-01",
      time: "18:00",
      location: "Abuja Flagship Store",
      price: 25000,
      capacity: 80,
      attendees: 80,
      status: "completed",
      image: "❤️",
      description: "Red carpet evening unveiling the new season of luxury couple experiences.",
    },
  ])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [eventSearchTerm, setEventSearchTerm] = useState("")
  const [eventFilterStatus, setEventFilterStatus] = useState<EventItem["status"] | "all">("all")
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    category: "",
    date: "",
    time: "",
    location: "",
    price: "",
    capacity: "",
    description: "",
    image: "",
  })

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
  const eventStatuses: EventItem["status"][] = ["upcoming", "ongoing", "completed", "cancelled"]

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

  const handleEditProduct = () => {
    if (!selectedProduct) return

    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...selectedProduct,
              price: Number.parseFloat(selectedProduct.price.toString()),
              stock: Number.parseInt(selectedProduct.stock.toString()),
            }
          : p
      )
    )
    setShowEditProduct(false)
    setSelectedProduct(null)
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }


  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time && newEvent.location) {
      const event: EventItem = {
        id: Date.now(),
        title: newEvent.title,
        category: newEvent.category || "General Event",
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        price: newEvent.price ? Number.parseFloat(newEvent.price) : 0,
        capacity: newEvent.capacity ? Number.parseInt(newEvent.capacity, 10) : 0,
        attendees: 0,
        status: "upcoming",
        image: newEvent.image || "🎉",
        description: newEvent.description,
      }
      setEvents([...events, event])
      setNewEvent({
        title: "",
        category: "",
        date: "",
        time: "",
        location: "",
        price: "",
        capacity: "",
        description: "",
        image: "",
      })
      setShowAddEvent(false)
    }
  }

  const handleEditEvent = () => {
    if (!selectedEvent) return

    setEvents(
      events.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...selectedEvent,
              price: Number.parseFloat(selectedEvent.price.toString()),
              capacity: Number.parseInt(selectedEvent.capacity.toString(), 10),
            }
          : event
      )
    )
    setShowEditEvent(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || product.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, filterCategory])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = eventSearchTerm.toLowerCase()
      const matchesSearch =
        event.title.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      const matchesStatus = eventFilterStatus === "all" || event.status === eventFilterStatus
      return matchesSearch && matchesStatus
    })
  }, [events, eventSearchTerm, eventFilterStatus])

  const eventStats = useMemo(() => {
    const totalEvents = events.length
    const upcomingEvents = events.filter((event) => event.status === "upcoming").length
    const registeredAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0)
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0)
    const averageFillRate =
      totalCapacity > 0 ? Math.round((registeredAttendees / totalCapacity) * 100) : 0

    return {
      totalEvents,
      upcomingEvents,
      registeredAttendees,
      averageFillRate,
    }
  }, [events])

  const eventAnalytics = useMemo(() => {
    if (events.length === 0) {
      return {
        totalRevenue: 0,
        averageTicketPrice: 0,
        averageAttendance: 0,
        capacityUtilization: 0,
        topEvent: null as EventItem | null,
        statusBreakdown: eventStatuses.map((status) => ({ status, count: 0, percentage: 0 })),
      }
    }

    const totalRevenue = events.reduce((sum, event) => sum + event.price * (event.attendees || 0), 0)
    const paidEvents = events.filter((event) => event.price > 0)
    const averageTicketPrice =
      paidEvents.length > 0
        ? Math.round(
            paidEvents.reduce((sum, event) => sum + event.price, 0) / paidEvents.length
          )
        : 0
    const averageAttendance = Math.round(
      events.reduce((sum, event) => sum + (event.attendees || 0), 0) / events.length
    )
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0)
    const capacityUtilization =
      totalCapacity > 0
        ? Math.round(
            (events.reduce((sum, event) => sum + (event.attendees || 0), 0) / totalCapacity) * 100
          )
        : 0
    const topEvent = events.reduce<EventItem | null>(
      (prev, current) => {
        if (!prev) return current
        return current.attendees > prev.attendees ? current : prev
      },
      null
    )
    const statusCounts = events.reduce<Record<EventItem["status"], number>>((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<EventItem["status"], number>)
    const statusBreakdown = eventStatuses.map((status) => {
      const count = statusCounts[status] || 0
      return {
        status,
        count,
        percentage: Math.round((count / events.length) * 100) || 0,
      }
    })

    return {
      totalRevenue,
      averageTicketPrice,
      averageAttendance,
      capacityUtilization,
      topEvent,
      statusBreakdown,
    }
  }, [events])

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{dashboardStats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold">{currencyFormatter.format(dashboardStats.monthlyRevenue)}</p>
            </div>
            <Wallet className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Orders</p>
              <p className="text-3xl font-bold">{dashboardStats.activeOrders}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold">{dashboardStats.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Recent Gift Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.customer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.product}</div>
                    <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.recipientName}</div>
                    <div className="text-sm text-gray-500">Delivery: {order.deliveryDate}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{currencyFormatter.format(order.total)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <span className="text-gray-600">Average Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{dashboardStats.avgRating}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Orders</span>
              <span className="font-medium">{dashboardStats.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Orders</span>
              <span className="font-medium text-yellow-600">{dashboardStats.pendingOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor Profile</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 text-sm">Business Name</span>
              <div className="font-medium">{vendorProfile.name}</div>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Member Since</span>
              <div className="font-medium">{vendorProfile.joinDate}</div>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Total Orders</span>
              <div className="font-medium">{vendorProfile.totalOrders}</div>
            </div>
          </div>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{product.image}</div>
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
        ))}
      </div>
    </div>
  )

  const EventsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Event Experiences</h2>
        <button
          onClick={() => setShowAddEvent(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Events",
            value: numberFormatter.format(eventStats.totalEvents),
            gradient: "from-indigo-500 to-indigo-600",
            accent: "text-indigo-100",
            iconAccent: "text-indigo-200",
            icon: Calendar,
          },
          {
            label: "Upcoming Events",
            value: numberFormatter.format(eventStats.upcomingEvents),
            gradient: "from-blue-500 to-blue-600",
            accent: "text-blue-100",
            iconAccent: "text-blue-200",
            icon: Clock,
          },
          {
            label: "Confirmed Guests",
            value: numberFormatter.format(eventStats.registeredAttendees),
            gradient: "from-pink-500 to-pink-600",
            accent: "text-pink-100",
            iconAccent: "text-pink-200",
            icon: Users,
          },
          {
            label: "Avg Fill Rate",
            value: `${eventStats.averageFillRate}%`,
            gradient: "from-emerald-500 to-emerald-600",
            accent: "text-emerald-100",
            iconAccent: "text-emerald-200",
            icon: TrendingUp,
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className={`bg-gradient-to-r ${metric.gradient} rounded-xl p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${metric.accent} text-sm`}>{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.iconAccent}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by name, location or type..."
            value={eventSearchTerm}
            onChange={(e) => setEventSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={eventFilterStatus}
          onChange={(e) => setEventFilterStatus(e.target.value as EventItem["status"] | "all")}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
        >
          <option value="all">All statuses</option>
          {eventStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          No events match your filters. Try adjusting your search or add a new experience.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{event.image}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvent({ ...event })
                        setShowEditEvent(true)
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {event.date} • {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees}/{event.capacity} attending
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{event.category}</span>
                  <span className="flex items-center gap-2 text-xl font-semibold text-blue-600">
                    <Ticket className="w-4 h-4" />
                    {event.price > 0 ? currencyFormatter.format(event.price) : "Free RSVP"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Event Performance</h3>
          <div className="space-y-4">
            {eventAnalytics.statusBreakdown.map(({ status, count, percentage }) => {
              const [statusTextClass] = getStatusColor(status).split(" ")
              const progressColor = statusTextClass ? statusTextClass.replace("text-", "bg-") : "bg-blue-500"
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-600 capitalize">
                    <span>{status}</span>
                    <span>
                      {count} • {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Total Event Revenue</div>
              <div className="text-xl font-semibold text-blue-600">
                {currencyFormatter.format(eventAnalytics.totalRevenue)}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Average Ticket Price</span>
              <span>{currencyFormatter.format(eventAnalytics.averageTicketPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Average Attendance</span>
              <span>{numberFormatter.format(eventAnalytics.averageAttendance)} guests</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Capacity Utilization</span>
              <span>{eventAnalytics.capacityUtilization}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Highlights</h3>
          {eventAnalytics.topEvent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{eventAnalytics.topEvent.image}</div>
                <div>
                  <h4 className="font-semibold text-lg">{eventAnalytics.topEvent.title}</h4>
                  <p className="text-sm text-gray-500">{eventAnalytics.topEvent.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.date} • {eventAnalytics.topEvent.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.attendees} guests confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{eventAnalytics.topEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Ticket className="w-4 h-4" />
                <span>
                  {eventAnalytics.topEvent.price > 0
                    ? `${currencyFormatter.format(eventAnalytics.topEvent.price)} tickets`
                    : "Free RSVP"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Add events to unlock engagement insights.</p>
          )}
        </div>
      </div>

    </div>
  )

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

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add New Gift Product</h3>
            <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gift Category</label>
            <select
              value={newProduct.giftCategory}
              onChange={(e) => setNewProduct({ ...newProduct, giftCategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select gift category</option>
              {giftCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter product description"
            />
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={() => setShowAddProduct(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProduct}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
    </div>
  )

  const EditProductModal = () =>
    selectedProduct && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button onClick={() => setShowEditProduct(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={selectedProduct.category}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gift Category</label>
              <select
                value={selectedProduct.giftCategory}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, giftCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {giftCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={selectedProduct.status}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    status: e.target.value as Product["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={() => {
                setShowEditProduct(false)
                setSelectedProduct(null)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditProduct}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
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


  const AddEventModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Schedule New Event</h3>
            <button onClick={() => setShowAddEvent(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience Type</label>
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select event type</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Physical address or virtual link"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Price</label>
              <input
                type="number"
                value={newEvent.price}
                onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0 for free"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                value={newEvent.capacity}
                onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Icon / Emoji</label>
            <input
              type="text"
              value={newEvent.image}
              onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Use an emoji to represent the event"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="What should attendees expect?"
            />
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={() => setShowAddEvent(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEvent}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>
    </div>
  )

  const EditEventModal = () =>
    selectedEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Update Event Details</h3>
              <button
                onClick={() => {
                  setShowEditEvent(false)
                  setSelectedEvent(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience Type</label>
              <select
                value={selectedEvent.category}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={selectedEvent.date}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={selectedEvent.time}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={selectedEvent.location}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ticket Price</label>
                <input
                  type="number"
                  value={selectedEvent.price}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  value={selectedEvent.capacity}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Status</label>
              <select
                value={selectedEvent.status}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    status: e.target.value as EventItem["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Icon / Emoji</label>
              <input
                type="text"
                value={selectedEvent.image}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={selectedEvent.description}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={() => {
                setShowEditEvent(false)
                setSelectedEvent(null)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditEvent}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )


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
        {activeTab === "events" && <EventsTab />}
        {activeTab === "orders" && <OrdersTab />}
      </main>

      {/* Modals */}
      {showAddProduct && <AddProductModal />}
      {showEditProduct && <EditProductModal />}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && <LogOut />}
      {showAddEvent && <AddEventModal />}
      {showEditEvent && <EditEventModal />}
    </div>
  )
}
