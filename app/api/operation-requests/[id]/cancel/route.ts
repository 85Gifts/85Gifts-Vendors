import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  return vendorProxy({
    method: 'POST',
    path: `/operation-requests/${encodeURIComponent(id)}/cancel`,
  })
}
