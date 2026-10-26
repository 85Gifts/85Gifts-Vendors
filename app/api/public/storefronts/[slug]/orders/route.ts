import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/public-proxy'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => ({}))

  return publicProxy({
    method: 'POST',
    path: `/storefronts/${encodeURIComponent(slug)}/orders`,
    body,
  })
}
