export type PublicStorefrontLayout = 'grid' | 'list'

export interface PublicStorefrontDisplaySettings {
  banner?: string
  theme?: string
  layout?: PublicStorefrontLayout
}

export interface PublicStorefrontVendor {
  businessName?: string
  name?: string
}

export interface PublicStorefrontVariant {
  size?: string
  color?: string
  price: number
  stock: number
  sku?: string
  images?: string[]
}

export interface PublicStorefrontProduct {
  id: string
  name: string
  description?: string
  category?: string
  price?: number
  stock?: number
  images?: string[]
  variants?: PublicStorefrontVariant[]
  [key: string]: unknown
}

export interface PublicStorefrontPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PublicStorefront {
  vendorId: string
  name: string
  slug: string
  description?: string
  displaySettings?: PublicStorefrontDisplaySettings
  publishedAt?: string
  productCount: number
  vendor?: PublicStorefrontVendor
  products?: PublicStorefrontProduct[]
  productsPagination?: PublicStorefrontPagination
}

export type PublicStorefrontListItem = Omit<
  PublicStorefront,
  'products' | 'productsPagination'
>

export interface PublicStorefrontListResult {
  storefronts: PublicStorefrontListItem[]
  pagination: PublicStorefrontPagination
}

export interface PublicStorefrontDetailResult {
  storefront: PublicStorefront
  pagination: PublicStorefrontPagination
}

export interface StorefrontOrderCustomer {
  name: string
  email: string
  phone?: string
}

export interface StorefrontOrderAddress {
  line1: string
  line2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface StorefrontOrderItem {
  productId: string
  quantity: number
  variantSku?: string
}

export interface StorefrontOrderInput {
  customer: StorefrontOrderCustomer
  deliveryAddress?: StorefrontOrderAddress
  items: StorefrontOrderItem[]
  callbackUrl?: string
}

export interface StorefrontOrderResult {
  message?: string
  orderReference: string
  storefrontName: string
  totalAmount: number
  paymentUrl?: string
  accessCode?: string
  reference?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  paidAt?: string
}
