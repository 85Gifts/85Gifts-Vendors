"use client"

import { useState, useMemo, useEffect } from "react"
import ProductForm from "@/components/ProductForm"
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
} from "lucide-react"
import { Button } from "./ui/button"
import Cookies from "js-cookie"
// import { cookies } from 'next/headers';
import { useRouter } from "next/navigation";
import { useToast } from "../components/ui/use-toast";


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
  // const [showAddProduct, setShowAddProduct] = useState(false);
  const { toast } = useToast();
  // const cookieStore = await cookies();

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    toast({
      title: "✅ Logged Out Successfully",
      description: "You have been signed out of your account.",
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

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const [productsError, setProductsError] = useState<string>("")

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [])

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

  const categories = ["Gift Sets", "Food & Treats", "Personalized", "Electronics", "Home & Garden", "Fashion"]
  const giftCategories = ["Birthday", "Anniversary", "Wedding", "Corporate", "Holiday", "Thank You"]

  const getStatusColor = (status: Product['status'] | Order['status']): string => {
    switch (status) {
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

    try {
      const response = await fetch(`/api/productId`, {
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



  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || product.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, filterCategory])

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
              <p className="text-3xl font-bold">₦{dashboardStats.monthlyRevenue.toLocaleString()}</p>
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
                  <td className="px-6 py-4 font-medium">₦{order.total}</td>
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
                <span className="text-2xl font-bold text-blue-600">₦{product.price}</span>
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
                    <div className="font-bold text-lg">₦{order.total}</div>
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
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "products", label: "Products", icon: Package },
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "products" && <ProductsTab />}
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
