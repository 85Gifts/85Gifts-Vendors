import { NextRequest } from 'next/server'
import { vendorProxy } from '@/lib/vendor-proxy'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  return vendorProxy({
    path: `/storefronts/${encodeURIComponent(id)}`,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  return vendorProxy({
    method: 'PUT',
    path: `/storefronts/${encodeURIComponent(id)}`,
    body,
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  return vendorProxy({
    method: 'DELETE',
    path: `/storefronts/${encodeURIComponent(id)}`,
  })
}
