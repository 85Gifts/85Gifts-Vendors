import type { Metadata } from 'next'
import { PublicStorefrontsListing } from '@/components/storefronts/public/PublicStorefrontsListing'
import { getPublicStorefronts } from '@/lib/publicStorefrontServer'
import type { PublicStorefrontListResult } from '@/app/types/publicStorefront'
import type { StorefrontSort } from '@/components/storefronts/public/PublicStorefrontsListing'

export const metadata: Metadata = {
  title: 'Storefronts | 85Gifts',
  description:
    'Discover gift storefronts from trusted vendors on 85Gifts. Browse products and check out securely.',
}

const PAGE_SIZE = 12

function parsePage(value?: string): number {
  const page = Number(value)
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
}

function parseSort(value?: string): StorefrontSort {
  if (value === 'oldest' || value === 'name' || value === 'name-desc') {
    return value
  }
  return 'newest'
}

function sortParams(sort: StorefrontSort): {
  sortBy: 'publishedAt' | 'name'
  sortOrder: 'asc' | 'desc'
} {
  switch (sort) {
    case 'oldest':
      return { sortBy: 'publishedAt', sortOrder: 'asc' }
    case 'name':
      return { sortBy: 'name', sortOrder: 'asc' }
    case 'name-desc':
      return { sortBy: 'name', sortOrder: 'desc' }
    default:
      return { sortBy: 'publishedAt', sortOrder: 'desc' }
  }
}

const EMPTY_RESULT: PublicStorefrontListResult = {
  storefronts: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 },
}

export default async function StorefrontsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const page = parsePage(params.page)
  const search = (params.search ?? '').trim().slice(0, 200)
  const sort = parseSort(params.sort)
  const sortOptions = sortParams(sort)

  let initial = EMPTY_RESULT
  let initialError = false

  try {
    initial = await getPublicStorefronts({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      ...sortOptions,
    })
  } catch {
    initialError = true
  }

  return (
    <PublicStorefrontsListing
      initial={initial}
      initialQuery={{ page, search, sort }}
      initialError={initialError}
    />
  )
}
