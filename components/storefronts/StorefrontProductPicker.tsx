"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"
import { storefrontApi } from "@/lib/storefrontApi"

interface VendorProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image?: string
}

interface StorefrontProductPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storefrontId: string
  existingProductIds: string[]
  onAdded: () => void
}

function unwrapProducts(json: any): any[] {
  const payload = json?.data?.data ?? json?.data ?? json
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.products)) return payload.products
  return []
}

function toVendorProduct(raw: any): VendorProduct | null {
  const id = raw?._id ?? raw?.id
  if (!id) return null
  const image =
    Array.isArray(raw?.images) && raw.images.length > 0
      ? raw.images[0]
      : typeof raw?.image === "string"
        ? raw.image
        : undefined

  return {
    id: String(id),
    name: String(raw?.name ?? "Untitled product"),
    category: String(raw?.category ?? "Uncategorised"),
    price: Number(raw?.price ?? 0),
    stock: Number(raw?.stock ?? 0),
    image,
  }
}

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
  currencyDisplay: "narrowSymbol",
})

export function StorefrontProductPicker({
  open,
  onOpenChange,
  storefrontId,
  existingProductIds,
  onAdded,
}: StorefrontProductPickerProps) {
  const { toast } = useToast()

  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [addingId, setAddingId] = useState<string | null>(null)

  const existing = useMemo(
    () => new Set(existingProductIds),
    [existingProductIds]
  )

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const json = await apiClient("/api/products", { requiresAuth: true })
      const next = unwrapProducts(json)
        .map(toVendorProduct)
        .filter((product): product is VendorProduct => Boolean(product))
      setProducts(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your products."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setSearch("")
    fetchProducts()
  }, [open, fetchProducts])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    )
  }, [products, search])

  const addProduct = async (product: VendorProduct) => {
    setAddingId(product.id)
    try {
      await storefrontApi.addProduct(storefrontId, product.id)
      toast({
        title: "Product added",
        description: `${product.name} is now in this storefront.`,
        variant: "success",
      })
      onAdded()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Could not add product",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !addingId && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Choose one of your products to add to this storefront. You can add
            more products afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name or category"
            className="pl-9"
            autoFocus
          />
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <p className="font-medium">Could not load products</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Package className="size-8 text-muted-foreground" />
            <p className="font-medium">
              {products.length === 0
                ? "You have no products yet"
                : "No products match your search"}
            </p>
            <p className="text-sm text-muted-foreground">
              {products.length === 0
                ? "Create a product from the Products page first."
                : "Try a different name or category."}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {filtered.map((product) => {
              const isAdded = existing.has(product.id)
              const isAdding = addingId === product.id

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3"
                >
                  <div
                    className="size-11 shrink-0 rounded-md bg-muted bg-cover bg-center"
                    style={
                      product.image
                        ? {
                            backgroundImage: `url("${product.image.replace(/"/g, "%22")}")`,
                          }
                        : undefined
                    }
                  >
                    {!product.image && (
                      <div className="flex h-full items-center justify-center text-lg">
                        🎁
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.category} · {currency.format(product.price)} ·{" "}
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "outline"}
                    disabled={isAdded || Boolean(addingId)}
                    onClick={() => addProduct(product)}
                  >
                    {isAdding ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                    {isAdded ? "Added" : "Add"}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
