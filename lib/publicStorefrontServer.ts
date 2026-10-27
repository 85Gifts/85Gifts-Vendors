import {
  normalizePublicStorefrontDetail,
  normalizePublicStorefrontList,
} from '@/lib/publicStorefrontApi'
import { publicFetchHttp } from '@/lib/public-server'
import type {
  PublicStorefrontDetailResult,
  PublicStorefrontListResult,
} from '@/app/types/publicStorefront'

export interface PublicStorefrontQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'publishedAt' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}

export async function getPublicStorefronts(
  query: PublicStorefrontQuery = {}
): Promise<PublicStorefrontListResult> {
  const result = await publicFetchHttp({
    path: '/storefronts',
    query,
    revalidate: 60,
  })

  if (!result.ok) {
    throw new Error(
      result.data?.message || 'Unable to load storefronts right now.'
    )
  }

  return normalizePublicStorefrontList(result.data)
}

export async function getPublicStorefront(
  slug: string,
  query: { page?: number; limit?: number } = {}
): Promise<PublicStorefrontDetailResult | null> {
  const result = await publicFetchHttp({
    path: `/storefronts/${encodeURIComponent(slug)}`,
    query,
    // The detail endpoint increments analytics, so it must not be cached.
    cache: 'no-store',
  })

  if (result.status === 404) return null
  if (!result.ok) {
    throw new Error(
      result.data?.message || 'Unable to load this storefront right now.'
    )
  }

  return normalizePublicStorefrontDetail(
    result.data,
    query.page ?? 1,
    query.limit ?? 20
  )
}
