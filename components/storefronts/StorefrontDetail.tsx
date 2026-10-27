"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Eye,
  Globe2,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Store,
  Trash2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useToast } from "@/components/ui/use-toast"
import { StorefrontFormDialog } from "@/components/storefronts/StorefrontFormDialog"
import { StorefrontProductPicker } from "@/components/storefronts/StorefrontProductPicker"
import { StorefrontStatusBadge } from "@/components/storefronts/StorefrontStatusBadge"
import {
  PublishStorefrontDialog,
  type StorefrontPublishAction,
} from "@/components/storefronts/PublishStorefrontDialog"
import { storefrontApi } from "@/lib/storefrontApi"
import { deriveStorefrontUiState } from "@/lib/storefrontPublish"
import {
  findLatestStorefrontRequest,
  vendorOperationRequestApi,
} from "@/lib/vendorOperationRequestApi"
import type {
  Storefront,
  StorefrontProduct,
} from "@/app/types/storefront"
import type {
  OperationRequest,
  StorefrontPublishPayload,
} from "@/app/types/operationRequest"

const PAGE_SIZE = 12

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
  currencyDisplay: "narrowSymbol",
})

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

function productImage(product: StorefrontProduct): string | undefined {
  if (typeof product.image === "string" && product.image) return product.image
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0]
  }
  return undefined
}

function productCategory(product: StorefrontProduct): string {
  return typeof product.category === "string" && product.category
    ? product.category
    : "Product"
}

function ProductThumb({ product }: { product: StorefrontProduct }) {
  const image = productImage(product)

  return (
    <div
      className="size-16 shrink-0 rounded-md bg-muted bg-cover bg-center"
      style={
        image
          ? { backgroundImage: `url("${image.replace(/"/g, "%22")}")` }
          : undefined
      }
    >
      {!image && (
        <div className="flex h-full items-center justify-center text-2xl">
          🎁
        </div>
      )}
    </div>
  )
}

export default function StorefrontDetail({
  storefrontId,
}: {
  storefrontId: string
}) {
  const { toast } = useToast()

  const [storefront, setStorefront] = useState<Storefront | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)

  const [products, setProducts] = useState<StorefrontProduct[]>([])
  const [productPage, setProductPage] = useState(1)
  const [productPagination, setProductPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  })
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState("")

  const [pickerOpen, setPickerOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [toRemove, setToRemove] = useState<StorefrontProduct | null>(null)
  const [removing, setRemoving] = useState(false)

  const [latestRequest, setLatestRequest] = useState<
    OperationRequest<StorefrontPublishPayload> | null
  >(null)
  const [publishAction, setPublishAction] =
    useState<StorefrontPublishAction | null>(null)
  const [publishBusy, setPublishBusy] = useState(false)

  const fetchStorefront = useCallback(async () => {
    setLoading(true)
    setError("")
    setNotFound(false)
    try {
      const result = await storefrontApi.get(storefrontId)
      if (!result) {
        setNotFound(true)
        setStorefront(null)
        return
      }
      setStorefront(result)
    } catch (err) {
      if ((err as { status?: number })?.status === 404) {
        setNotFound(true)
      } else {
        setError(
          err instanceof Error ? err.message : "Could not load the storefront."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [storefrontId])

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError("")
    try {
      const result = await storefrontApi.listProducts(storefrontId, {
        page: productPage,
        limit: PAGE_SIZE,
      })
      setProducts(result.products)
      setProductPagination(result.pagination)
    } catch (err) {
      setProductsError(
        err instanceof Error ? err.message : "Could not load storefront products."
      )
    } finally {
      setProductsLoading(false)
    }
  }, [storefrontId, productPage])

  const fetchLatestRequest = useCallback(async () => {
    try {
      const result = await vendorOperationRequestApi.list({ limit: 50 })
      const latest =
        findLatestStorefrontRequest(result.requests, storefrontId) ?? null
      setLatestRequest(latest)
      return latest
    } catch {
      // The storefront's own publishStatus still drives the UI when this
      // auxiliary request fails.
      setLatestRequest(null)
      return null
    }
  }, [storefrontId])

  const refreshStorefront = useCallback(async () => {
    try {
      const result = await storefrontApi.get(storefrontId)
      if (result) setStorefront(result)
    } catch {
      // Keep the last known storefront; the next explicit refresh can retry.
    }
  }, [storefrontId])

  useEffect(() => {
    fetchStorefront()
  }, [fetchStorefront])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchLatestRequest()
  }, [fetchLatestRequest])

  const handleRemoved = async () => {
    if (!toRemove) return
    setRemoving(true)
    try {
      await storefrontApi.removeProduct(storefrontId, toRemove._id)
      toast({
        title: "Product removed",
        description: `${toRemove.name ?? "The product"} was removed from this storefront.`,
        variant: "success",
      })
      setToRemove(null)
      if (products.length === 1 && productPage > 1) {
        setProductPage((current) => current - 1)
      } else {
        fetchProducts()
      }
      refreshStorefront()
    } catch (err) {
      toast({
        title: "Could not remove product",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemoving(false)
    }
  }

  const handlePublishRequest = async () => {
    setPublishBusy(true)
    try {
      const result = await storefrontApi.publish(storefrontId, true)

      if (result.storefront._id) {
        setStorefront(result.storefront)
      } else {
        await fetchStorefront()
      }

      if (result.operationRequest) {
        setLatestRequest(result.operationRequest)
      } else {
        await fetchLatestRequest()
      }

      toast({
        title: result.alreadyPending
          ? "Approval already pending"
          : "Approval requested",
        description: result.alreadyPending
          ? "An admin is already reviewing this storefront."
          : "We will show the decision here as soon as an admin reviews it.",
        variant: result.alreadyPending ? "default" : "success",
      })
      setPublishAction(null)
    } catch (err) {
      toast({
        title: "Could not request approval",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setPublishBusy(false)
    }
  }

  const handleUnpublish = async () => {
    setPublishBusy(true)
    try {
      const result = await storefrontApi.publish(storefrontId, false)

      if (result.storefront._id) {
        setStorefront(result.storefront)
      } else {
        setStorefront((current) =>
          current
            ? { ...current, isPublished: false, publishStatus: "draft" }
            : current
        )
      }

      setLatestRequest(null)
      toast({
        title: "Storefront unpublished",
        description: "The public link is no longer available.",
        variant: "success",
      })
      setPublishAction(null)
    } catch (err) {
      toast({
        title: "Could not unpublish",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setPublishBusy(false)
    }
  }

  const handleCancelRequest = async () => {
    let target = latestRequest
    if (!target) {
      target = await fetchLatestRequest()
    }

    if (!target) {
      toast({
        title: "No pending request found",
        description:
          "The request may have already been reviewed. Refresh the page to see the latest status.",
        variant: "destructive",
      })
      setPublishAction(null)
      return
    }

    setPublishBusy(true)
    try {
      await vendorOperationRequestApi.cancel(target._id)
      setLatestRequest((current) =>
        current ? { ...current, status: "cancelled" } : current
      )
      setStorefront((current) =>
        current
          ? { ...current, isPublished: false, publishStatus: "draft" }
          : current
      )
      toast({
        title: "Approval request cancelled",
        description: "The storefront is back in draft. You can request approval again whenever you are ready.",
        variant: "success",
      })
      setPublishAction(null)
    } catch (err) {
      toast({
        title: "Could not cancel request",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setPublishBusy(false)
    }
  }

  const confirmPublishAction = () => {
    if (publishAction === "unpublish") {
      void handleUnpublish()
    } else if (publishAction === "cancel") {
      void handleCancelRequest()
    } else {
      void handlePublishRequest()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-52 w-full" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Store className="size-10 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold">Storefront not found</p>
            <p className="text-sm text-muted-foreground">
              It may have been deleted or belongs to another vendor.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/storefronts">
              <ArrowLeft className="size-4" />
              Back to storefronts
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error || !storefront) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="size-9 text-destructive" />
          <div>
            <p className="text-lg font-semibold">Could not load storefront</p>
            <p className="text-sm text-muted-foreground">
              {error || "The storefront is unavailable."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchStorefront}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/storefronts">Back to storefronts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const banner = storefront.displaySettings?.banner
  const layout = storefront.displaySettings?.layout ?? "grid"
  const existingProductIds = storefront.products.map(
    (product) => product._id
  )

  const uiState = deriveStorefrontUiState(storefront, latestRequest)
  const publishPresentation = {
    draft: {
      icon: Store,
      title: "Not published",
      description:
        "Request admin approval when the storefront is ready. It stays private until an admin approves it.",
      action: "publish" as StorefrontPublishAction,
      label: "Request approval",
      variant: "default" as const,
      card: "border-muted bg-muted/30",
      iconClass: "text-muted-foreground",
    },
    pending: {
      icon: Clock,
      title: "Waiting for approval",
      description: latestRequest?.createdAt
        ? `Submitted ${formatDate(latestRequest.createdAt)}. An admin will review it. You can cancel the request while it is pending.`
        : "An admin will review the storefront. You can cancel the request while it is pending.",
      action: "cancel" as StorefrontPublishAction,
      label: "Cancel request",
      variant: "outline" as const,
      card: "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50",
      iconClass: "text-amber-600 dark:text-amber-300",
    },
    published: {
      icon: Globe2,
      title: "Published",
      description: `Live at /${storefront.slug}${
        storefront.publishedAt
          ? ` since ${formatDate(storefront.publishedAt)}`
          : ""
      }. Unpublishing takes it offline immediately.`,
      action: "unpublish" as StorefrontPublishAction,
      label: "Unpublish",
      variant: "outline" as const,
      card: "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/50",
      iconClass: "text-green-600 dark:text-green-300",
    },
    rejected: {
      icon: XCircle,
      title: "Changes requested",
      description:
        "An admin asked for changes before this storefront can be published. Review the note, update the storefront, then request approval again.",
      action: "resubmit" as StorefrontPublishAction,
      label: "Request approval again",
      variant: "default" as const,
      card: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/50",
      iconClass: "text-red-600 dark:text-red-300",
    },
  }[uiState]
  const PublishIcon = publishPresentation.icon

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/dashboard/storefronts">
          <ArrowLeft className="size-4" />
          All storefronts
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div
          className="relative h-40 bg-muted bg-cover bg-center"
          style={
            banner
              ? { backgroundImage: `url("${banner.replace(/"/g, "%22")}")` }
              : undefined
          }
        >
          {!banner && (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 via-background to-purple-100 dark:from-blue-950 dark:via-background dark:to-purple-950">
              <Store className="size-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardHeader className="gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{storefront.name}</CardTitle>
                <StorefrontStatusBadge status={storefront.publishStatus} />
              </div>
              <code className="text-xs text-muted-foreground">
                /{storefront.slug}
              </code>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Edit storefront
            </Button>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {storefront.description || "No description yet."}
          </p>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-3 pt-0 xl:grid-cols-4">
          <div className="rounded-md border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="size-3.5" /> Products
            </p>
            <p className="text-xl font-semibold">{storefront.products.length}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> Views
            </p>
            <p className="text-xl font-semibold">{storefront.analytics.views}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShoppingBag className="size-3.5" /> Orders
            </p>
            <p className="text-xl font-semibold">
              {storefront.analytics.totalOrders}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> Created
            </p>
            <p className="text-sm font-medium">
              {formatDate(storefront.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={publishPresentation.card}>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <PublishIcon
              className={`mt-0.5 size-5 shrink-0 ${publishPresentation.iconClass}`}
            />
            <div>
              <p className="font-medium">{publishPresentation.title}</p>
              <p className="text-sm text-muted-foreground">
                {publishPresentation.description}
              </p>
              {uiState === "rejected" && latestRequest?.reviewNote && (
                <p className="mt-2 rounded-md border border-red-200 bg-background/70 px-2.5 py-1.5 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
                  <span className="font-medium">Admin note:</span>{" "}
                  {latestRequest.reviewNote}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant={publishPresentation.variant}
            onClick={() => setPublishAction(publishPresentation.action)}
            disabled={publishBusy}
            className="shrink-0"
          >
            {publishPresentation.label}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">
            {productPagination.total}{" "}
            {productPagination.total === 1 ? "product" : "products"} in this
            storefront · {layout} layout
          </p>
        </div>
        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      {productsError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{productsError}</p>
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : productsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Package className="size-9 text-muted-foreground" />
            <div>
              <p className="font-medium">No products in this storefront</p>
              <p className="text-sm text-muted-foreground">
                Add products to give customers something to browse.
              </p>
            </div>
            <Button onClick={() => setPickerOpen(true)}>
              <Plus className="size-4" />
              Add your first product
            </Button>
          </CardContent>
        </Card>
      ) : layout === "list" ? (
        <div className="divide-y rounded-md border">
          {products.map((product) => (
            <div key={product._id} className="flex items-center gap-3 p-3">
              <ProductThumb product={product} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {product.name ?? "Untitled product"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {productCategory(product)} · {currency.format(product.price ?? 0)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setToRemove(product)}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div
                className="h-32 bg-muted bg-cover bg-center"
                style={
                  productImage(product)
                    ? {
                        backgroundImage: `url("${productImage(product)!.replace(/"/g, "%22")}")`,
                      }
                    : undefined
                }
              >
                {!productImage(product) && (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🎁
                  </div>
                )}
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {product.name ?? "Untitled product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {productCategory(product)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {currency.format(product.price ?? 0)}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setToRemove(product)}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {productPagination.pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {productPagination.page} of {productPagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setProductPage((current) => Math.max(1, current - 1))
              }
              disabled={productPage <= 1 || productsLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setProductPage((current) =>
                  Math.min(productPagination.pages, current + 1)
                )
              }
              disabled={
                productPage >= productPagination.pages || productsLoading
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <StorefrontProductPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        storefrontId={storefrontId}
        existingProductIds={existingProductIds}
        onAdded={() => {
          fetchProducts()
          refreshStorefront()
        }}
      />

      <StorefrontFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        storefront={storefront}
        onSaved={(saved) => {
          setStorefront(saved)
          refreshStorefront()
        }}
      />

      {publishAction && (
        <PublishStorefrontDialog
          open
          onOpenChange={(open) => {
            if (!open) setPublishAction(null)
          }}
          action={publishAction}
          storefrontName={storefront.name}
          submitting={publishBusy}
          onConfirm={confirmPublishAction}
        />
      )}

      <AlertDialog
        open={Boolean(toRemove)}
        onOpenChange={(open) => {
          if (!open && !removing) setToRemove(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRemove
                ? `“${toRemove.name ?? "This product"}” will no longer appear in the storefront. The product itself will not be deleted.`
                : "The product will no longer appear in the storefront."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault()
                handleRemoved()
              }}
              disabled={removing}
            >
              {removing && <Loader2 className="size-4 animate-spin" />}
              Remove product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
