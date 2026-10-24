import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  const query: Record<string, string> = {}
  for (const key of ['page', 'limit']) {
    const value = searchParams.get(key)
    if (value) query[key] = value
  }

  return vendorProxy({
    path: `/storefronts/${encodeURIComponent(id)}/products`,
    query,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  return vendorProxy({
    method: 'POST',
    path: `/storefronts/${encodeURIComponent(id)}/products`,
    body,
  })
}
