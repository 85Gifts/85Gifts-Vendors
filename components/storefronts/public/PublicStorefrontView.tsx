'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CircleCheckBigIcon,
  GiftIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
} from '@animateicons/react/lucide'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { PublicFooter } from '@/components/public-footer'
import { PublicNavbar } from '@/components/public-navbar'
import { StorefrontProductCard } from '@/components/storefronts/public/StorefrontProductCard'
import { StorefrontProductOptionsDialog } from '@/components/storefronts/public/StorefrontProductOptionsDialog'
import { StorefrontCartSheet } from '@/components/storefronts/public/StorefrontCartSheet'
import { StorefrontCheckoutDialog } from '@/components/storefronts/public/StorefrontCheckoutDialog'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import { formatNaira } from '@/lib/currency'
import { publicStorefrontApi, PublicStorefrontApiError } from '@/lib/publicStorefrontApi'
import {
  STOREFRONT_PATTERN_STYLE,
  storefrontAccent,
  storefrontInitials,
} from '@/lib/storefrontVisuals'
import {
  buildCartItem,
  cartCount,
  cartSubtotal,
  isProductSoldOut,
  mergeCartItem,
  productHasVariants,
  type StorefrontCartItem,
} from '@/lib/storefrontCart'
import type {
  PublicStorefront,
  PublicStorefrontPagination,
  PublicStorefrontProduct,
  PublicStorefrontVariant,
} from '@/app/types/publicStorefront'

const PRODUCTS_PER_PAGE = 12

function pageNumbers(current: number, pages: number): number[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(current - 1, pages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function ProductArt({
  product,
  className,
}: {
  product: PublicStorefrontProduct
  className?: string
}) {
  const image = product.images?.[0]
  if (image) {
    return (
      <div
        className={`bg-cover bg-center ${className ?? ''}`}
        style={{ backgroundImage: cssBackgroundImage(image) }}
        role="img"
        aria-label={product.name}
     />
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-blue-950/60 text-blue-200 ${
        className ?? ''
      }`}
      aria-hidden="true"
    >
      <GiftIcon size={32} />
    </div>
  )
}

function HeroMosaic({
  storefront,
  products,
}: {
  storefront: PublicStorefront
  products: PublicStorefrontProduct[]
}) {
  const tiles = products.slice(0, 4)

  if (tiles.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04]">
        <div
          className={`absolute inset-0 ${storefrontAccent(storefront.slug)} opacity-60`}
          aria-hidden="true"
       />
        <div className="relative flex h-full min-h-64 flex-col justify-end p-6">
          <StoreIcon size={40} className="mb-4 text-white/50" />
          <p className="text-sm font-medium text-white">
            New collection coming soon
          </p>
          <p className="mt-1 text-xs text-white/60">
            This vendor is still setting up their products.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((product, index) => (
        <div
          key={product.id}
          className={`group relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.04] ${
            index > 1 ? 'hidden sm:block' : ''
          }`}
        >
          <ProductArt
            product={product}
            className="aspect-[5/4] w-full transition-transform duration-700 group-hover:scale-105"
         />
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-slate-950/85 px-2.5 py-2">
            <p className="line-clamp-1 text-xs font-medium text-white">
              {product.name}
            </p>
            <p className="text-[11px] text-white/60">
              {product.price === 0 ? 'Free' : formatNaira(product.price ?? 0)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsSkeleton({ layout }: { layout: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-2xl border bg-card p-3 sm:p-4"
          >
            <Skeleton className="size-24 shrink-0 rounded-xl sm:size-32" />
            <div className="flex-1 space-y-3 py-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border bg-card"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PublicStorefrontView({
  storefront,
  initialPagination,
  initialError = false,
}: {
  storefront: PublicStorefront
  initialPagination: PublicStorefrontPagination
  initialError?: boolean
}) {
  const { toast } = useToast()
  const [products, setProducts] = useState(storefront.products ?? [])
  const [pagination, setPagination] = useState(initialPagination)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productError, setProductError] = useState<string | null>(
    initialError ? 'Products are temporarily unavailable.' : null
  )

  const [cart, setCart] = useState<StorefrontCartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [optionsProduct, setOptionsProduct] =
    useState<PublicStorefrontProduct | null>(null)

  const productsRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)

  const layout =
    storefront.displaySettings?.layout === 'list' ? 'list' : 'grid'
  const count = cartCount(cart)
  const subtotal = cartSubtotal(cart)
  const vendorName =
    storefront.vendor?.businessName || storefront.vendor?.name || '85Gifts vendor'
  const addItem = (
    product: PublicStorefrontProduct,
    variant?: PublicStorefrontVariant,
    quantity = 1
  ) => {
    const incoming = buildCartItem(product, variant, quantity)
    const existing = cart.find((item) => item.key === incoming.key)

    if (existing && existing.quantity >= existing.maxQuantity) {
      toast({
        title: 'Maximum quantity reached',
        description: `Only ${existing.maxQuantity} of ${product.name} available.`,
      })
      return
    }

    setCart((current) => mergeCartItem(current, incoming))
    toast({
      title: 'Added to cart',
      description: `${product.name}${
        variant?.sku ? ` · ${variant.sku}` : ''
      } added.`,
    })
  }

  const handleAdd = (product: PublicStorefrontProduct) => {
    if (isProductSoldOut(product)) return
    if (productHasVariants(product)) {
      setOptionsProduct(product)
      setOptionsOpen(true)
      return
    }
    addItem(product)
  }

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (targetPage < 1 || targetPage > Math.max(1, pagination.pages)) return
      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller
      setLoadingProducts(true)
      setProductError(null)

      try {
        const result = await publicStorefrontApi.get(
          storefront.slug,
          { page: targetPage, limit: PRODUCTS_PER_PAGE },
          controller.signal
        )
        setProducts(result.storefront.products ?? [])
        setPagination(result.pagination)
        const pageQuery =
          result.pagination.page > 1
            ? `?page=${result.pagination.page}`
            : ''
        window.history.replaceState(
          null,
          '',
          `/store/${encodeURIComponent(storefront.slug)}${pageQuery}`
        )
        window.setTimeout(() => {
          productsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 50)
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') {
          return
        }
        setProductError(
          caught instanceof PublicStorefrontApiError
            ? caught.message
            : 'We could not load more products.'
        )
      } finally {
        if (!controller.signal.aborted) setLoadingProducts(false)
      }
    },
    [pagination.pages, storefront.slug]
  )

  const updateQuantity = (key: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.maxQuantity)),
            }
          : item
      )
    )
  }

  const removeItem = (key: string) => {
    setCart((current) => current.filter((item) => item.key !== key))
  }

  const handleOrderCreated = () => {
    setCart([])
    setCheckoutOpen(false)
    setCartOpen(false)
  }

  const pages = Math.max(1, pagination.pages)
  const publishedLabel = storefront.publishedAt
    ? new Date(storefront.publishedAt).toLocaleDateString('en-NG', {
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar onDark />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#05070d] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={STOREFRONT_PATTERN_STYLE}
          aria-hidden="true"
       />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-36 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/storefronts"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:border-white/25 hover:text-white"
            >
              <ArrowLeftIcon size={14} />
              All storefronts
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
              <BadgeCheckIcon size={14} />
              Verified vendor
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6">
            <div className="relative flex flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0b1120] p-6 sm:p-8">
              <div
                className="absolute -right-16 -top-16 size-48 rounded-full border border-white/10"
                aria-hidden="true"
             />
              <div
                className="absolute -right-6 -top-6 size-32 rounded-full border border-white/5"
                aria-hidden="true"
             />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xs font-bold text-white backdrop-blur">
                    {storefrontInitials(storefront.name)}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                      Storefront by
                    </p>
                    <p className="text-xs font-medium text-white/85">
                      {vendorName}
                    </p>
                  </div>
                  <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-blue-300">
                    <StoreIcon size={12} />
                    Storefront
                  </div>
                </div>

                <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                  {storefront.name}
                </h1>
                {storefront.description ? (
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    {storefront.description}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                  <div className="inline-flex items-center gap-1.5">
                    <GiftIcon size={14} className="text-blue-400" />
                    <span className="text-white">{storefront.productCount}</span>
                    {storefront.productCount === 1 ? ' product' : ' products'}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <ShieldCheckIcon size={14} className="text-emerald-400" />
                    Secure Paystack checkout
                  </div>
                  {publishedLabel ? (
                    <div className="inline-flex items-center gap-1.5">
                      <SparklesIcon size={14} className="text-sky-400" />
                      Open since {publishedLabel}
                    </div>
                  ) : null}
                </div>

                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => setCartOpen(true)}
                    className="relative h-11 w-full bg-blue-600 text-white hover:bg-blue-500 sm:w-auto"
                  >
                    <ShoppingBagIcon size={16} />
                    View cart
                    {count > 0 ? (
                      <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-700">
                        {count}
                      </span>
                    ) : null}
                  </Button>
                  <button
                    type="button"
                    onClick={() =>
                      productsRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white/85 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Browse the collection
                    <ArrowUpRightIcon size={16} />
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-white/10 pt-5 text-[11px] text-slate-400">
                  <div className="inline-flex items-center gap-1.5">
                    <ShieldCheckIcon size={14} className="text-emerald-400" />
                    Payments secured by Paystack
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <BadgeCheckIcon size={14} className="text-sky-400" />
                    Fulfilled by {vendorName}
                  </div>
                </div>
              </div>
            </div>

            <HeroMosaic storefront={storefront} products={products} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:py-12 lg:px-8">
        <div ref={productsRef} className="scroll-mt-24">
          <div className="mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Curated by {vendorName}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                The collection
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {loadingProducts
                  ? 'Loading products…'
                  : `${pagination.total} ${
                      pagination.total === 1 ? 'item' : 'items'
                    } available from this storefront`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
                <CircleCheckBigIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                Vendor fulfilled
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
                <ShieldCheckIcon size={14} className="text-blue-600 dark:text-blue-400" />
                Secure payment
              </div>
            </div>
          </div>

          {productError ? (
            <div className="rounded-[1.6rem] border border-dashed bg-card p-10 text-center">
              <StoreIcon size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Products are unavailable</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {productError}
              </p>
              <Button className="mt-5" onClick={() => void loadPage(pagination.page)}>
                <RotateCcwIcon size={16} />
                Try again
              </Button>
            </div>
          ) : loadingProducts && products.length === 0 ? (
            <ProductsSkeleton layout={layout} />
          ) : products.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed bg-card p-12 text-center">
              <GiftIcon size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This vendor has not added products to their storefront.
              </p>
            </div>
          ) : (
            <div
              aria-busy={loadingProducts}
              className={
                layout === 'list'
                  ? `space-y-3 transition-opacity ${
                      loadingProducts ? 'pointer-events-none opacity-60' : ''
                    }`
                  : `grid grid-cols-2 gap-4 transition-opacity sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 ${
                      loadingProducts ? 'pointer-events-none opacity-60' : ''
                    }`
              }
            >
              {products.map((product) => (
                <StorefrontProductCard
                  key={product.id}
                  product={product}
                  layout={layout}
                  onAdd={handleAdd}
               />
              ))}
            </div>
          )}

          {loadingProducts && products.length > 0 ? (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon size={16} className="animate-spin" />
                Loading products…
              </div>
            </div>
          ) : null}

          {pages > 1 && !productError ? (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
              aria-label="Product pagination"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadPage(pagination.page - 1)}
                disabled={pagination.page <= 1 || loadingProducts}
                aria-label="Previous products page"
              >
                <ArrowLeftIcon size={16} />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {pageNumbers(pagination.page, pages).map((number) => (
                <Button
                  key={number}
                  variant={number === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => void loadPage(number)}
                  disabled={loadingProducts}
                  aria-current={number === pagination.page ? 'page' : undefined}
                  className="min-w-9"
                >
                  {number}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadPage(pagination.page + 1)}
                disabled={pagination.page >= pages || loadingProducts}
                aria-label="Next products page"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRightIcon size={16} />
              </Button>
            </nav>
          ) : null}
        </div>
      </main>

      {count > 0 && !cartOpen && !checkoutOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b14]/95 p-3 text-white backdrop-blur-md sm:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400">
                {count} {count === 1 ? 'item' : 'items'}
              </p>
              <p className="text-sm font-bold">{formatNaira(subtotal)}</p>
            </div>
            <Button
              onClick={() => setCartOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              <ShoppingBagIcon size={16} />
              View cart
            </Button>
          </div>
        </div>
      ) : null}

      <PublicFooter />

      <StorefrontProductOptionsDialog
        product={optionsProduct}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onAdd={(product, variant, quantity) =>
          addItem(product, variant, quantity)
        }
     />

      <StorefrontCartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false)
          // Let the cart sheet finish its exit animation before mounting the
          // checkout dialog. Overlapping Radix modals can otherwise restore
          // the body's pointer-events to the sheet's locked value.
          window.setTimeout(() => setCheckoutOpen(true), 350)
        }}
     />

      <StorefrontCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        storefront={storefront}
        items={cart}
        onOrderCreated={handleOrderCreated}
     />
    </div>
  )
}
