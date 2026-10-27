import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

const LIST_QUERY_KEYS = ['page', 'limit', 'status']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const query: Record<string, string> = {}
  for (const key of LIST_QUERY_KEYS) {
    const value = searchParams.get(key)
    if (value) query[key] = value
  }

  return vendorProxy({ path: '/operation-requests', query })
}
