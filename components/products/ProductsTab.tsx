"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
  Boxes,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "../ui/use-toast"

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

interface ProductsTabProps {
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string | number) => void
  onRefreshRequested?: (refreshFn: () => Promise<void>) => void
}

export default function ProductsTab({ onAddProduct, onEditProduct, onDeleteProduct, onRefreshRequested }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const [productsError, setProductsError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  const categories = ["Gift Sets", "Food & Treats", "Personalized", "Electronics", "Home & Garden", "Fashion"]

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

  const fetchProducts = useCallback(async () => {
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
  }, [])

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(fetchProducts)
    }
  }, [onRefreshRequested, fetchProducts])

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
      
      // Call parent's onDeleteProduct callback
      onDeleteProduct(id)
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : 'Failed to delete product',
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: Product["status"]): string => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100"
      case "out_of_stock":
        return "text-red-600 bg-red-100"
      case "inactive":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || product.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, filterCategory])

  // Dummy data for product stats - will be replaced with API endpoint later
  const productStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    outOfStockProducts: products.filter(p => p.status === 'out_of_stock').length,
    totalRevenue: products.reduce((sum, p) => sum + (p.price * p.sales), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold">
                {productsLoading ? (
                  <span className="text-blue-200">Loading...</span>
                ) : (
                  productStats.totalProducts
                )}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Products</p>
              <p className="text-3xl font-bold">
                {productsLoading ? (
                  <span className="text-green-200">Loading...</span>
                ) : (
                  productStats.activeProducts
                )}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Out of Stock</p>
              <p className="text-3xl font-bold">
                {productsLoading ? (
                  <span className="text-red-200">Loading...</span>
                ) : (
                  productStats.outOfStockProducts
                )}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">
                {productsLoading ? (
                  <span className="text-purple-200">Loading...</span>
                ) : (
                  currencyFormatter.format(productStats.totalRevenue)
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Gift Products</h2>
        <button
          onClick={onAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {productsError && !productsLoading && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <p className="font-semibold">Error loading products</p>
          <p className="text-sm">{productsError}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 text-sm underline hover:no-underline dark:text-red-300"
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
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No products found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Add your first product to get started</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 hover:shadow-md transition-shadow overflow-hidden">
                {/* Product Image */}
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {/* Manage Inventory Button */}
                  <button
                    onClick={() => router.push('/inventory')}
                    className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm bg-opacity-90 hover:scale-105 z-10"
                    title="Manage Inventory"
                  >
                    <Boxes className="w-3 h-3" />
                    <span>Manage Inventory</span>
                  </button>
                  
                  {product.image && product.image.startsWith('http') ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-emoji')) {
                          const emoji = document.createElement('span');
                          emoji.className = 'fallback-emoji text-6xl';
                          emoji.textContent = '🎁';
                          parent.appendChild(emoji);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-6xl">{product.image || '🎁'}</span>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 dark:text-white">{product.name}</h3>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 dark:text-gray-400">{product.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>Stock: {product.stock}</span>
                    <span>Sales: {product.sales}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currencyFormatter.format(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{product.giftCategory}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

