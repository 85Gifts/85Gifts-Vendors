import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/public-proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const query: Record<string, string> = {}

  for (const key of ['page', 'limit']) {
    const value = searchParams.get(key)
    if (value) query[key] = value
  }

  return publicProxy({
    path: `/storefronts/${encodeURIComponent(slug)}`,
    query,
  })
}
