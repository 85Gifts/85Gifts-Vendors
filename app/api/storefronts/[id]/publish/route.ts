import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  return vendorProxy({
    method: 'POST',
    path: `/storefronts/${encodeURIComponent(id)}/publish`,
    body,
  })
}
