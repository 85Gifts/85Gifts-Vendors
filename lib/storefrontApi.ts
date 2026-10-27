import { apiClient } from '@/lib/api'
import type { Pagination } from '@/app/types/admin'
import type {
  Storefront,
  StorefrontDisplaySettings,
  StorefrontInput,
  StorefrontLayout,
  StorefrontList,
  StorefrontProduct,
  StorefrontProductList,
  StorefrontPublishResult,
  StorefrontPublishStatus,
  StorefrontSummary,
  StorefrontUpdateInput,
} from '@/app/types/storefront'
import type {
  OperationRequest,
  StorefrontPublishPayload,
} from '@/app/types/operationRequest'

type QueryValue = string | number | boolean | undefined

function buildQuery(params: Record<string, QueryValue> = {}): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

/** Unwraps `{ data: { data: ... } }`, `{ data: ... }`, or a raw payload. */
function payload(json: any): any {
  return json?.data?.data ?? json?.data ?? json
}

function asRecord(value: any): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizePagination(raw: any): Pagination {
  const pagination = asRecord(raw)
  return {
    page: toNumber(pagination.page, 1),
    limit: toNumber(pagination.limit, 20),
    total: toNumber(pagination.total),
    pages: toNumber(pagination.pages, 1),
  }
}

function normalizePublishStatus(
  raw: any,
  isPublished: boolean
): StorefrontPublishStatus {
  const status = raw?.publishStatus
  if (
    status === 'draft' ||
    status === 'pending' ||
    status === 'published' ||
    status === 'rejected'
  ) {
    return status
  }
  return isPublished ? 'published' : 'draft'
}

function normalizeDisplaySettings(raw: any): StorefrontDisplaySettings | undefined {
  const settings = asRecord(raw)
  if (Object.keys(settings).length === 0) return undefined

  const layout =
    settings.layout === 'grid' || settings.layout === 'list'
      ? (settings.layout as StorefrontLayout)
      : undefined

  const banner =
    typeof settings.banner === 'string' ? settings.banner : undefined
  const theme = typeof settings.theme === 'string' ? settings.theme : undefined

  return { banner, theme, layout }
}

function normalizeProduct(raw: any): StorefrontProduct | null {
  if (typeof raw === 'string') {
    return raw ? { _id: raw } : null
  }

  const product = asRecord(raw)
  const id = product._id ?? product.id
  if (!id) return null

  return { ...product, _id: String(id) } as StorefrontProduct
}

export function normalizeStorefront(raw: any): Storefront {
  const storefront = asRecord(raw)
  const isPublished = Boolean(storefront.isPublished)
  const analytics = asRecord(storefront.analytics)

  return {
    _id: String(storefront._id ?? storefront.id ?? ''),
    vendorId: String(storefront.vendorId ?? ''),
    name: String(storefront.name ?? ''),
    description:
      typeof storefront.description === 'string'
        ? storefront.description
        : undefined,
    slug: String(storefront.slug ?? ''),
    products: Array.isArray(storefront.products)
      ? (storefront.products
          .map(normalizeProduct)
          .filter(Boolean) as StorefrontProduct[])
      : [],
    isPublished,
    publishStatus: normalizePublishStatus(storefront, isPublished),
    publishedAt:
      typeof storefront.publishedAt === 'string'
        ? storefront.publishedAt
        : undefined,
    displaySettings: normalizeDisplaySettings(storefront.displaySettings),
    analytics: {
      views: toNumber(analytics.views),
      totalOrders: toNumber(analytics.totalOrders),
    },
    createdAt: String(storefront.createdAt ?? ''),
    updatedAt: String(storefront.updatedAt ?? ''),
  }
}

function unwrapStorefront(json: any): Storefront | null {
  const data = payload(json)
  const candidate = data?.storefront ?? data?.data?.storefront ?? data
  const storefront = normalizeStorefront(candidate)
  return storefront._id ? storefront : null
}

function normalizeStorefrontList(json: any): StorefrontList {
  const data = payload(json)
  const list = Array.isArray(data?.storefronts)
    ? data.storefronts
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

  return {
    storefronts: list
      .map(normalizeStorefront)
      .filter((storefront: Storefront) => Boolean(storefront._id)),
    pagination: normalizePagination(data?.pagination),
  }
}

function normalizeProductList(json: any): StorefrontProductList {
  const data = payload(json)
  const list = Array.isArray(data?.products)
    ? data.products
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

  return {
    products: list
      .map(normalizeProduct)
      .filter(Boolean) as StorefrontProduct[],
    pagination: normalizePagination(data?.pagination),
  }
}

function normalizePublishResult(json: any): StorefrontPublishResult {
  const data = payload(json)
  const storefrontRaw =
    data?.storefront ?? data?.data?.storefront ?? data?.storefrontData

  const storefront = normalizeStorefront(storefrontRaw)
  const operationRequest =
    data?.operationRequest ?? data?.request ?? undefined

  // A 202 response returns the request and an unpublished storefront. Some
  // implementations omit publishStatus, so infer "pending" from the request.
  if (
    operationRequest &&
    !storefront.isPublished &&
    storefront.publishStatus === 'draft'
  ) {
    storefront.publishStatus = 'pending'
  }

  // Unpublishing is immediate and returns the storefront; never leave it
  // labelled "published" just because the previous status was stale.
  if (
    !storefront.isPublished &&
    !operationRequest &&
    storefront.publishStatus === 'published'
  ) {
    storefront.publishStatus = 'draft'
  }

  const alreadyPending = Boolean(
    data?.alreadyPending ||
      data?.publishStatus === 'pending' ||
      (!operationRequest && storefront.publishStatus === 'pending')
  )

  return {
    storefront,
    operationRequest: operationRequest as
      | OperationRequest<StorefrontPublishPayload>
      | undefined,
    alreadyPending,
  }
}

export const storefrontApi = {
  list: async (
    params: Record<string, QueryValue> = {}
  ): Promise<StorefrontList> => {
    const json = await apiClient(`/api/storefronts${buildQuery(params)}`, {
      requiresAuth: true,
    })
    return normalizeStorefrontList(json)
  },

  get: async (storefrontId: string): Promise<Storefront | null> => {
    const json = await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}`,
      { requiresAuth: true }
    )
    return unwrapStorefront(json)
  },

  create: async (input: StorefrontInput): Promise<Storefront | null> => {
    const json = await apiClient('/api/storefronts', {
      method: 'POST',
      body: JSON.stringify(input),
      requiresAuth: true,
    })
    return unwrapStorefront(json)
  },

  update: async (
    storefrontId: string,
    input: StorefrontUpdateInput
  ): Promise<Storefront | null> => {
    const json = await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
        requiresAuth: true,
      }
    )
    return unwrapStorefront(json)
  },

  remove: async (storefrontId: string): Promise<void> => {
    await apiClient(`/api/storefronts/${encodeURIComponent(storefrontId)}`, {
      method: 'DELETE',
      requiresAuth: true,
    })
  },

  summary: async (): Promise<StorefrontSummary> => {
    const json = await apiClient('/api/storefronts/summary', {
      requiresAuth: true,
    })
    const data = payload(json)
    const summary = asRecord(data?.summary ?? data)

    return {
      totalStorefronts: toNumber(summary.totalStorefronts),
      publishedStorefronts: toNumber(summary.publishedStorefronts),
      draftStorefronts: toNumber(summary.draftStorefronts),
      totalProductsAcrossStorefronts: toNumber(
        summary.totalProductsAcrossStorefronts
      ),
    }
  },

  publish: async (
    storefrontId: string,
    isPublished: boolean
  ): Promise<StorefrontPublishResult> => {
    const json = await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({ isPublished }),
        requiresAuth: true,
      }
    )
    return normalizePublishResult(json)
  },

  listProducts: async (
    storefrontId: string,
    params: Record<string, QueryValue> = {}
  ): Promise<StorefrontProductList> => {
    const json = await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}/products${buildQuery(params)}`,
      { requiresAuth: true }
    )
    return normalizeProductList(json)
  },

  addProduct: async (
    storefrontId: string,
    productId: string
  ): Promise<void> => {
    await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}/products`,
      {
        method: 'POST',
        body: JSON.stringify({ productId }),
        requiresAuth: true,
      }
    )
  },

  removeProduct: async (
    storefrontId: string,
    productId: string
  ): Promise<void> => {
    await apiClient(
      `/api/storefronts/${encodeURIComponent(storefrontId)}/products/${encodeURIComponent(productId)}`,
      {
        method: 'DELETE',
        requiresAuth: true,
      }
    )
  },
}
