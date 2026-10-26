import type {
  PublicStorefront,
  PublicStorefrontDetailResult,
  PublicStorefrontDisplaySettings,
  PublicStorefrontLayout,
  PublicStorefrontListResult,
  PublicStorefrontPagination,
  PublicStorefrontProduct,
  PublicStorefrontVariant,
  StorefrontOrderInput,
  StorefrontOrderResult,
} from '@/app/types/publicStorefront'

type QueryValue = string | number | boolean | undefined

export class PublicStorefrontApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'PublicStorefrontApiError'
    this.status = status
    this.code = code
  }
}

export function buildPublicQuery(
  params: Record<string, QueryValue> = {}
): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

export function normalizePublicPagination(
  raw: unknown,
  fallbackLimit = 20
): PublicStorefrontPagination {
  const pagination = asRecord(raw)
  return {
    page: Math.max(1, toNumber(pagination.page, 1)),
    limit: Math.max(1, toNumber(pagination.limit, fallbackLimit)),
    total: Math.max(0, toNumber(pagination.total)),
    pages: Math.max(1, toNumber(pagination.pages, 1)),
  }
}

function normalizeImages(...values: unknown[]): string[] | undefined {
  for (const value of values) {
    if (Array.isArray(value)) {
      const images = value.filter(
        (image): image is string => typeof image === 'string' && image.length > 0
      )
      if (images.length > 0) return images
    } else if (typeof value === 'string' && value.length > 0) {
      return [value]
    }
  }
  return undefined
}

function normalizeVariant(raw: unknown): PublicStorefrontVariant | null {
  const variant = asRecord(raw)
  const price = toNumber(variant.price, NaN)
  const stock = toNumber(variant.stock, 0)
  if (!Number.isFinite(price)) return null

  return {
    size: typeof variant.size === 'string' ? variant.size : undefined,
    color: typeof variant.color === 'string' ? variant.color : undefined,
    price,
    stock: Math.max(0, stock),
    sku: typeof variant.sku === 'string' ? variant.sku : undefined,
    images: normalizeImages(variant.images),
  }
}

function normalizeProduct(raw: unknown): PublicStorefrontProduct | null {
  const product = asRecord(raw)
  const id = toStringValue(product.id ?? product._id)
  if (!id) return null

  const variants = Array.isArray(product.variants)
    ? (product.variants
        .map(normalizeVariant)
        .filter(Boolean) as PublicStorefrontVariant[])
    : []

  const price = toNumber(product.price, NaN)
  const hasStock = product.stock !== undefined && product.stock !== null

  return {
    ...product,
    id,
    name: toStringValue(product.name) || 'Product',
    description:
      typeof product.description === 'string' ? product.description : undefined,
    category:
      typeof product.category === 'string' ? product.category : undefined,
    price: Number.isFinite(price) ? price : undefined,
    stock: hasStock ? Math.max(0, toNumber(product.stock)) : undefined,
    images: normalizeImages(product.images, product.image, product.thumbnail),
    variants,
  }
}

function normalizeDisplaySettings(
  raw: unknown
): PublicStorefrontDisplaySettings | undefined {
  const settings = asRecord(raw)
  if (Object.keys(settings).length === 0) return undefined

  const layout =
    settings.layout === 'grid' || settings.layout === 'list'
      ? (settings.layout as PublicStorefrontLayout)
      : undefined

  return {
    banner: typeof settings.banner === 'string' ? settings.banner : undefined,
    theme: typeof settings.theme === 'string' ? settings.theme : undefined,
    layout,
  }
}

function normalizeVendor(raw: unknown) {
  const vendor = asRecord(raw)
  if (Object.keys(vendor).length === 0) return undefined
  return {
    businessName:
      typeof vendor.businessName === 'string' ? vendor.businessName : undefined,
    name: typeof vendor.name === 'string' ? vendor.name : undefined,
  }
}

export function normalizePublicStorefront(raw: unknown): PublicStorefront {
  const storefront = asRecord(raw)
  const products = Array.isArray(storefront.products)
    ? (storefront.products
        .map(normalizeProduct)
        .filter(Boolean) as PublicStorefrontProduct[])
    : undefined

  return {
    vendorId: toStringValue(storefront.vendorId),
    name: toStringValue(storefront.name) || 'Storefront',
    slug: toStringValue(storefront.slug),
    description:
      typeof storefront.description === 'string'
        ? storefront.description
        : undefined,
    displaySettings: normalizeDisplaySettings(storefront.displaySettings),
    publishedAt:
      typeof storefront.publishedAt === 'string'
        ? storefront.publishedAt
        : undefined,
    productCount: Math.max(
      0,
      toNumber(storefront.productCount, products?.length ?? 0)
    ),
    vendor: normalizeVendor(storefront.vendor),
    products,
    productsPagination:
      storefront.productsPagination !== undefined
        ? normalizePublicPagination(storefront.productsPagination)
        : undefined,
  }
}

export function normalizePublicStorefrontList(
  json: unknown
): PublicStorefrontListResult {
  const root = asRecord(json)
  const data = asRecord(root.data ?? root)

  const list = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.storefronts)
      ? data.storefronts
      : Array.isArray(root.data)
        ? root.data
        : Array.isArray(root.storefronts)
          ? root.storefronts
          : []

  return {
    storefronts: list
      .map(normalizePublicStorefront)
      .filter((storefront) => Boolean(storefront.slug)),
    pagination: normalizePublicPagination(
      data.pagination ?? root.pagination
    ),
  }
}

export function normalizePublicStorefrontDetail(
  json: unknown,
  fallbackPage = 1,
  fallbackLimit = 20
): PublicStorefrontDetailResult {
  const root = asRecord(json)
  const outer = asRecord(root.data ?? root)
  const candidate =
    outer.storefront ??
    (asRecord(outer.data).slug ? outer.data : undefined) ??
    (outer.slug ? outer : outer.data)

  const storefront = normalizePublicStorefront(candidate)
  const rawPagination =
    asRecord(candidate).productsPagination ??
    outer.productsPagination ??
    outer.pagination

  const pagination = rawPagination
    ? normalizePublicPagination(rawPagination, fallbackLimit)
    : {
        page: fallbackPage,
        limit: fallbackLimit,
        total: storefront.productCount,
        pages: 1,
      }

  return { storefront, pagination }
}

export function normalizeStorefrontOrder(
  json: unknown
): StorefrontOrderResult {
  const root = asRecord(json)
  const outer = asRecord(root.data ?? root)
  const data = asRecord(outer.data ?? outer)

  return {
    message: typeof data.message === 'string' ? data.message : undefined,
    orderReference:
      toStringValue(data.orderReference ?? data.reference) || 'Unknown',
    storefrontName: toStringValue(data.storefrontName),
    totalAmount: toNumber(data.totalAmount),
    paymentUrl:
      typeof data.paymentUrl === 'string' ? data.paymentUrl : undefined,
    accessCode:
      typeof data.accessCode === 'string' ? data.accessCode : undefined,
    reference: typeof data.reference === 'string' ? data.reference : undefined,
    paymentStatus:
      typeof data.paymentStatus === 'string' ? data.paymentStatus : undefined,
    fulfillmentStatus:
      typeof data.fulfillmentStatus === 'string'
        ? data.fulfillmentStatus
        : undefined,
    paidAt: typeof data.paidAt === 'string' ? data.paidAt : undefined,
  }
}

function errorMessage(json: unknown, fallback: string): string {
  const root = asRecord(json)
  const data = asRecord(root.data)
  return (
    (typeof root.message === 'string' && root.message) ||
    (typeof data.message === 'string' && data.message) ||
    (typeof root.error === 'string' && root.error) ||
    (typeof asRecord(root.error).message === 'string' &&
      asRecord(root.error).message) ||
    fallback
  )
}

function errorCode(json: unknown): string | undefined {
  const root = asRecord(json)
  return typeof root.code === 'string'
    ? root.code
    : typeof asRecord(root.error).code === 'string'
      ? asRecord(root.error).code
      : undefined
}

async function request<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch (error) {
    if (init.signal?.aborted) throw error
    throw new PublicStorefrontApiError(
      'We could not reach the storefront service. Please check your connection and try again.',
      0
    )
  }

  let json: unknown = {}
  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (!response.ok) {
    throw new PublicStorefrontApiError(
      errorMessage(json, 'Something went wrong. Please try again.'),
      response.status,
      errorCode(json)
    )
  }

  return json as T
}

export const publicStorefrontApi = {
  list: (
    params: Record<string, QueryValue> = {},
    signal?: AbortSignal
  ): Promise<PublicStorefrontListResult> =>
    request<unknown>(`/api/public/storefronts${buildPublicQuery(params)}`, {
      signal,
    }).then(normalizePublicStorefrontList),

  get: (
    slug: string,
    params: Record<string, QueryValue> = {},
    signal?: AbortSignal
  ): Promise<PublicStorefrontDetailResult> =>
    request<unknown>(
      `/api/public/storefronts/${encodeURIComponent(slug)}${buildPublicQuery(
        params
      )}`,
      { signal }
    ).then((json) =>
      normalizePublicStorefrontDetail(
        json,
        toNumber(params.page, 1),
        toNumber(params.limit, 20)
      )
    ),

  createOrder: (
    slug: string,
    input: StorefrontOrderInput
  ): Promise<StorefrontOrderResult> =>
    request<unknown>(
      `/api/public/storefronts/${encodeURIComponent(slug)}/orders`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    ).then(normalizeStorefrontOrder),
}
