'use client'

import { GiftIcon, PlusIcon, ShoppingBagIcon } from '@animateicons/react/lucide'
import { Button } from '@/components/ui/button'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import { formatNaira } from '@/lib/currency'
import {
  isProductSoldOut,
  productHasVariants,
  productTotalStock,
  productUnitPrice,
} from '@/lib/storefrontCart'
import type { PublicStorefrontProduct } from '@/app/types/publicStorefront'

function ProductImage({
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
      className={`relative flex items-center justify-center overflow-hidden bg-blue-500/10 text-blue-500 dark:text-blue-300 ${
        className ?? ''
      }`}
      aria-hidden="true"
    >
      <GiftIcon size={32} className="relative " />
    </div>
  )
}

export function StorefrontProductCard({
  product,
  layout,
  onAdd,
}: {
  product: PublicStorefrontProduct
  layout: 'grid' | 'list'
  onAdd: (product: PublicStorefrontProduct) => void
}) {
  const hasVariants = productHasVariants(product)
  const soldOut = isProductSoldOut(product)
  const stock = productTotalStock(product)
  const price = productUnitPrice(product)
  const priceLabel =
    price === 0
      ? 'Free'
      : hasVariants
        ? `From ${formatNaira(price)}`
        : formatNaira(price)
  const actionLabel = soldOut
    ? 'Sold out'
    : hasVariants
      ? 'Options'
      : 'Add'

  const details = (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2">
        {layout === 'list' && product.category ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
            {product.category}
          </span>
        ) : null}
        {hasVariants ? (
          <span className="text-[11px] text-muted-foreground">
            {product.variants?.length} options
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
        {product.name}
      </h3>
      {product.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {product.description}
        </p>
      ) : null}

      <div className="mt-auto pt-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-blue-600 dark:text-blue-400 sm:text-base">
              {priceLabel}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {soldOut
                ? 'Out of stock'
                : typeof stock === 'number'
                  ? `${stock} in stock`
                  : 'Available'}
            </p>
          </div>
          {layout === 'list' ? (
            <Button
              size="sm"
              onClick={() => onAdd(product)}
              disabled={soldOut}
              className="h-8 shrink-0 px-2.5 text-xs"
              aria-label={`${actionLabel}: ${product.name}`}
            >
              {soldOut ? (
                <ShoppingBagIcon size={14} />
              ) : (
                <PlusIcon size={14} />
              )}
              {actionLabel}
            </Button>
          ) : null}
        </div>
        {layout === 'grid' ? (
          <Button
            size="sm"
            onClick={() => onAdd(product)}
            disabled={soldOut}
            className="mt-2.5 h-8 w-full text-xs"
            aria-label={`${actionLabel}: ${product.name}`}
          >
            {soldOut ? (
              <ShoppingBagIcon size={14} />
            ) : (
              <PlusIcon size={14} />
            )}
            {actionLabel === 'Add' ? 'Add to cart' : actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )

  if (layout === 'list') {
    return (
      <article className="group flex gap-3 rounded-2xl border bg-card p-3 transition-colors hover:border-blue-500/30 sm:gap-4 sm:p-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl sm:size-32">
          <ProductImage
            product={product}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
         />
          {soldOut ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-[10px] font-medium uppercase tracking-wide">
              Sold out
            </div>
          ) : null}
        </div>
        {details}
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/35 hover:shadow-[0_18px_50px_-30px_rgba(37,99,235,0.6)]">
      <div className="relative aspect-square overflow-hidden">
        <ProductImage
          product={product}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
       />
        {product.category ? (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-slate-950/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white backdrop-blur sm:left-3 sm:top-3 sm:text-[10px]">
            {product.category}
          </span>
        ) : null}
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/65 backdrop-blur-[1px]">
            <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-sm">
              Sold out
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">{details}</div>
    </article>
  )
}
