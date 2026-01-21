"use client"

import { useState } from "react"
import { Heart, ShoppingCart } from "lucide-react"
import PurchaseModal from "@/components/inventory/PurchaseModal"
import { useToast } from "@/components/ui/use-toast"
import { PublicInventoryLink } from "@/app/types/inventory"

interface ProductShareClientProps {
  link: PublicInventoryLink
}

export default function ProductShareClient({ link }: ProductShareClientProps) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToWishlist = async () => {
    setIsWishlistLoading(true)
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        "https://eight5giftsvendors-be.onrender.com"

      const response = await fetch(
        `${API_URL}/api/public/inventory/${link.linkCode}/wishlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "", // You might want to collect email in a modal
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to add to wishlist")
      }

      toast({
        title: "Added to wishlist!",
        description: "You'll be notified when this product is available.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to add to wishlist",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsWishlistLoading(false)
    }
  }

  // Get the first product for hero display
  const mainProduct = link.items[0]

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

          <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
            <p className="text-sm uppercase tracking-wider text-white/70">
              Product Collection
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              {link.items.length === 1
                ? mainProduct?.name
                : link.items.length > 1
                ? link.items.map(item => item.name).join(', ')
                : link.title || 'Product Collection'}
            </h1>
            {link.items.length > 0 && (
              <p className="mt-3 text-white/80">
                {link.items.length} {link.items.length === 1 ? 'item' : 'items'} in this collection
              </p>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={isWishlistLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-5 h-5" />
                {isWishlistLoading ? "Adding..." : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </section>

        {/* Products Details Section */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Product Details</h2>
              <p className="mt-2 text-gray-600">
                {link.items.length === 1
                  ? "View product information below"
                  : `View ${link.items.length} products in this collection`}
              </p>
            </div>

            {/* Products List */}
            <div className="space-y-6">
              {link.items.map((product) => (
                <div
                  key={product.inventoryId}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {product.name}
                      </h3>

                      <div className="mt-6 flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₦{product.price.toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {product.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₦{product.total.toLocaleString(
                              "en-NG",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  ₦{link.amount.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        slug={link.linkCode}
        products={link.items}
        totalAmount={link.amount}
      />
    </>
  )
}
