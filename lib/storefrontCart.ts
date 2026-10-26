import type {
  PublicStorefrontProduct,
  PublicStorefrontVariant,
} from '@/app/types/publicStorefront'

export interface StorefrontCartItem {
  key: string
  productId: string
  name: string
  image?: string
  category?: string
  variantSku?: string
  variantLabel?: string
  unitPrice: number
  quantity: number
  maxQuantity: number
}

export function variantLabel(
  variant?: PublicStorefrontVariant
): string | undefined {
  if (!variant) return undefined
  const label = [variant.color, variant.size]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' / ')
  return label || variant.sku
}

export function variantStock(
  variant?: PublicStorefrontVariant
): number | undefined {
  return variant ? variant.stock : undefined
}

export function productHasVariants(product: PublicStorefrontProduct): boolean {
  return Array.isArray(product.variants) && product.variants.length > 0
}

export function productUnitPrice(
  product: PublicStorefrontProduct,
  variant?: PublicStorefrontVariant
): number {
  if (variant) return variant.price
  if (productHasVariants(product)) {
    const prices = (product.variants ?? [])
      .map((entry) => entry.price)
      .filter((price) => Number.isFinite(price))
    if (prices.length > 0) return Math.min(...prices)
  }
  if (typeof product.price === 'number') return product.price
  return 0
}

export function productTotalStock(
  product: PublicStorefrontProduct
): number | undefined {
  if (productHasVariants(product)) {
    return (product.variants ?? []).reduce(
      (total, variant) => total + Math.max(0, variant.stock),
      0
    )
  }
  return typeof product.stock === 'number' ? product.stock : undefined
}

export function isProductSoldOut(product: PublicStorefrontProduct): boolean {
  const stock = productTotalStock(product)
  return stock !== undefined && stock <= 0
}

export function cartItemKey(productId: string, variantSku?: string): string {
  return variantSku ? `${productId}:${variantSku}` : productId
}

export function buildCartItem(
  product: PublicStorefrontProduct,
  variant: PublicStorefrontVariant | undefined,
  quantity: number,
  imageOverride?: string
): StorefrontCartItem {
  const stock = variant ? variant.stock : product.stock
  const maxQuantity = Math.max(
    1,
    Math.min(50, typeof stock === 'number' ? stock : 50)
  )

  return {
    key: cartItemKey(product.id, variant?.sku),
    productId: product.id,
    name: product.name,
    image: imageOverride ?? variant?.images?.[0] ?? product.images?.[0],
    category: product.category,
    variantSku: variant?.sku,
    variantLabel: variantLabel(variant),
    unitPrice: productUnitPrice(product, variant),
    quantity: Math.min(Math.max(1, quantity), maxQuantity),
    maxQuantity,
  }
}

export function mergeCartItem(
  items: StorefrontCartItem[],
  incoming: StorefrontCartItem
): StorefrontCartItem[] {
  const existing = items.find((item) => item.key === incoming.key)
  if (!existing) return [...items, incoming]

  return items.map((item) =>
    item.key === incoming.key
      ? {
          ...item,
          quantity: Math.min(
            item.quantity + incoming.quantity,
            item.maxQuantity
          ),
        }
      : item
  )
}

export function cartSubtotal(items: StorefrontCartItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )
}

export function cartCount(items: StorefrontCartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}
