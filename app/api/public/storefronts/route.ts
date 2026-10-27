import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/public-proxy'

const LIST_QUERY_KEYS = ['page', 'limit', 'search', 'sortBy', 'sortOrder']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query: Record<string, string> = {}

  for (const key of LIST_QUERY_KEYS) {
    const value = searchParams.get(key)
    if (value) query[key] = value
  }

  return publicProxy({ path: '/storefronts', query })
}
