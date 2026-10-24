import type { Pagination } from '@/app/types/admin'
import type {
  OperationRequest,
  StorefrontPublishPayload,
} from '@/app/types/operationRequest'

export type StorefrontLayout = 'grid' | 'list'

export type StorefrontPublishStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'

/** Client-side state derived from the storefront and its latest request. */
export type StorefrontUiState =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'

export interface StorefrontDisplaySettings {
  banner?: string
  theme?: string
  layout?: StorefrontLayout
}

export interface StorefrontAnalytics {
  views: number
  totalOrders: number
}

export interface StorefrontProduct {
  _id: string
  name?: string
  description?: string
  price?: number
  image?: string
  images?: string[]
  status?: string
  [key: string]: unknown
}

export interface Storefront {
  _id: string
  vendorId: string
  name: string
  description?: string
  slug: string
  products: StorefrontProduct[]
  isPublished: boolean
  /**
   * Used by the publish workflow but omitted from parts of the documented
   * model. Always normalize it before rendering.
   */
  publishStatus: StorefrontPublishStatus
  publishedAt?: string
  displaySettings?: StorefrontDisplaySettings
  analytics: StorefrontAnalytics
  createdAt: string
  updatedAt: string
}

export interface StorefrontInput {
  name: string
  description?: string
  slug?: string
  displaySettings?: StorefrontDisplaySettings
}

export type StorefrontUpdateInput = Omit<StorefrontInput, 'slug'>

export interface StorefrontSummary {
  totalStorefronts: number
  publishedStorefronts: number
  draftStorefronts: number
  totalProductsAcrossStorefronts: number
}

export interface StorefrontList {
  storefronts: Storefront[]
  pagination: Pagination
}

export interface StorefrontProductList {
  products: StorefrontProduct[]
  pagination: Pagination
}

export interface StorefrontPublishResult {
  storefront: Storefront
  operationRequest?: OperationRequest<StorefrontPublishPayload>
  /** True when the backend returned 200 because a request was already pending. */
  alreadyPending: boolean
}
