"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useComingSoon } from "@/contexts/ComingSoonContext"
import { useToast } from "../ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ProductForm from "@/components/ProductForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const [productsError, setProductsError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { showComingSoon } = useComingSoon()

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditProduct(true)
  }

  const confirmDeleteProduct = async () => {
    const id = productToDelete?.id
    if (!id) return
    try {
      const response = await fetch(`/api/productId?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete product")
      }

      await fetchProducts()
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setProductToDelete(null)
    }
  }

  const onAddProductClick = useCallback(() => {
    showComingSoon({ featureLabel: "Add new product" })
  }, [showComingSoon])

  // Carousel state for mobile
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

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

  const handleManageInventory = async (product: Product) => {
    if (!product.id) {
      toast({
        title: "Error",
        description: "Product ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.id.toString(),
          sellingPrice: product.price,
          quantity: product.stock,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create inventory')
      }

      toast({
        title: "Inventory created",
        description: "Inventory has been created successfully. Redirecting to inventory page...",
        variant: "success",
      })

      // Navigate to inventory page after a short delay
      setTimeout(() => {
        router.push('/inventory')
      }, 1000)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create inventory',
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product)
  }

  const getStatusColor = (status: Product["status"]): string => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100"
      case "out_of_stock":
        return "text-red-600 bg-red-100"
      case "inactive":
        return "text-muted-foreground bg-muted"
      default:
        return "text-muted-foreground bg-muted"
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

  const statsCards = useMemo(() => [
    {
      id: 'total-products',
      label: 'Total Products',
      value: productsLoading ? 'Loading...' : productStats.totalProducts.toString(),
      icon: Package,
      hasButton: true,
    },
    {
      id: 'active-products',
      label: 'Active Products',
      value: productsLoading ? 'Loading...' : productStats.activeProducts.toString(),
      icon: CheckCircle,
    },
    {
      id: 'out-of-stock',
      label: 'Out of Stock',
      value: productsLoading ? 'Loading...' : productStats.outOfStockProducts.toString(),
      icon: XCircle,
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: productsLoading ? 'Loading...' : currencyFormatter.format(productStats.totalRevenue),
      icon: DollarSign,
    },
  ], [productStats, productsLoading, currencyFormatter])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
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

  return (
    <div className="space-y-6">
      {/* Stats Grid - Desktop / Carousel - Mobile */}
      <div className="relative">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.id} className="bg-card border border-border rounded-xl p-6 text-foreground">
                <div className={`flex items-center justify-between ${card.hasButton ? 'mb-4' : ''}`}>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold">
                      {productsLoading ? (
                        <span className="text-muted-foreground">{card.value}</span>
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                {card.hasButton && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={onAddProductClick}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Product
                    </Button>
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
                  <div className="bg-card border border-border rounded-xl p-6 text-foreground h-full min-h-[160px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {card.label}
                        </p>
                        <p className="text-3xl font-bold">
                          {productsLoading ? (
                            <span className="text-muted-foreground">{card.value}</span>
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex gap-2 h-[32px]">
                      {card.hasButton ? (
                        <Button
                          type="button"
                          onClick={onAddProductClick}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Product
                        </Button>
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10"
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
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10"
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

        {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
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
          <p className="mt-2 text-muted-foreground">Loading products...</p>
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
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No products found</p>
              <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-2">Add your first product to get started</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-card rounded-xl shadow-sm border dark:border-border hover:shadow-md transition-shadow overflow-hidden">
                {/* Product Image */}
                <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {/* Manage Inventory Button */}
                  <Button
                    onClick={() => handleManageInventory(product)}
                    size="xs"
                    className="absolute top-2 right-2 z-10 flex items-center gap-1.5"
                    title="Manage Inventory"
                  >
                    <Boxes className="w-3 h-3" />
                    <span>Manage Inventory</span>
                  </Button>
                  
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
                        onClick={() => handleEditProduct(product)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground">{product.category}</span>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <span>Stock: {product.stock}</span>
                    <span>Sales: {product.sales}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {currencyFormatter.format(product.price)}
                    </span>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{product.giftCategory}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showEditProduct && selectedProduct && (
        <ProductForm
          product={{
            id: selectedProduct.id.toString(),
            name: selectedProduct.name,
            description: selectedProduct.description || "",
            price: selectedProduct.price,
            category: selectedProduct.category,
            stock: selectedProduct.stock,
            images:
              selectedProduct.images && selectedProduct.images.length > 0
                ? selectedProduct.images.join(",")
                : selectedProduct.image.startsWith("http")
                ? selectedProduct.image
                : "",
          }}
          isEdit={true}
          onclose={() => {
            setShowEditProduct(false)
            setSelectedProduct(null)
          }}
          onSuccess={async () => {
            await fetchProducts()
            toast({
              title: "Product updated",
              description: "The product has been successfully updated.",
              variant: "success",
            })
          }}
        />
      )}

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              &ldquo;{productToDelete?.name}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

