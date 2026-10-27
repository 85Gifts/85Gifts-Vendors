import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId } = await params

  return vendorProxy({
    method: 'DELETE',
    path: `/storefronts/${encodeURIComponent(id)}/products/${encodeURIComponent(productId)}`,
  })
}
