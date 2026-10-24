import { NextRequest } from 'next/server'
import { adminProxy } from '@/lib/admin-proxy'

const LIST_QUERY_KEYS = ['page', 'limit', 'status', 'type']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const query: Record<string, string> = {}
  for (const key of LIST_QUERY_KEYS) {
    const value = searchParams.get(key)
    if (value) query[key] = value
  }

  return adminProxy({ path: '/operation-requests', query })
}
