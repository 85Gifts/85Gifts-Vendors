'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  GiftIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from '@animateicons/react/lucide'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import { formatNaira } from '@/lib/currency'
import { variantLabel } from '@/lib/storefrontCart'
import type {
  PublicStorefrontProduct,
  PublicStorefrontVariant,
} from '@/app/types/publicStorefront'

export function StorefrontProductOptionsDialog({
  product,
  open,
  onOpenChange,
  onAdd,
}: {
  product: PublicStorefrontProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (
    product: PublicStorefrontProduct,
    variant: PublicStorefrontVariant,
    quantity: number
  ) => void
}) {
  const variants = useMemo(() => product?.variants ?? [], [product])
  const [selectedSku, setSelectedSku] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!open || !product) return
    const firstAvailable = variants.find(
      (variant) => Boolean(variant.sku) && variant.stock > 0
    )
    setSelectedSku(firstAvailable?.sku ?? variants[0]?.sku ?? '')
    setQuantity(1)
  }, [open, product, variants])

  const selectedVariant = variants.find(
    (variant) => variant.sku === selectedSku
  )
  const image = selectedVariant?.images?.[0] ?? product?.images?.[0]
  const maxQuantity = Math.max(1, Math.min(50, selectedVariant?.stock ?? 1))
  const canAdd = Boolean(
    selectedVariant && selectedVariant.sku && selectedVariant.stock > 0
  )
  const price = selectedVariant?.price ?? product?.price ?? 0

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="pr-8">{product.name}</DialogTitle>
          <DialogDescription>
            Choose an option before adding this item to your cart.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          {image ? (
            <div
              className="size-24 shrink-0 rounded-xl bg-cover bg-center sm:size-28"
              style={{ backgroundImage: cssBackgroundImage(image) }}
              role="img"
              aria-label={product.name}
           />
          ) : (
            <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 sm:size-28 dark:text-blue-300">
              <GiftIcon size={32} />
            </div>
          )}
          <div className="min-w-0">
            {product.category ? (
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
            ) : null}
            <p className="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatNaira(price)}
            </p>
            {product.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Available options</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {variants.map((variant) => {
              const available = Boolean(variant.sku) && variant.stock > 0
              const label = variantLabel(variant) || variant.sku || 'Option'
              const active = variant.sku === selectedSku
              return (
                <button
                  key={variant.sku || label}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSelectedSku(variant.sku ?? '')
                    setQuantity(1)
                  }}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/30'
                      : 'bg-background hover:border-blue-400'
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatNaira(variant.price)} ·{' '}
                    {available ? `${variant.stock} in stock` : 'Unavailable'}
                  </span>
                </button>
              )
            })}
          </div>
          {variants.length > 0 &&
          !variants.some((variant) => Boolean(variant.sku)) ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              These options are not available for online checkout yet.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <MinusIcon size={16} />
            </Button>
            <span className="w-10 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setQuantity((current) =>
                  Math.min(maxQuantity, current + 1)
                )
              }
              disabled={!canAdd || quantity >= maxQuantity}
              aria-label="Increase quantity"
            >
              <PlusIcon size={16} />
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-row flex-wrap justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canAdd}
            onClick={() => {
              if (!selectedVariant) return
              onAdd(product, selectedVariant, quantity)
              onOpenChange(false)
            }}
          >
            <ShoppingBagIcon size={16} />
            Add to cart · {formatNaira(price * quantity)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
