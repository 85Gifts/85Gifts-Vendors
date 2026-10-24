import { NextRequest } from 'next/server'
import { adminProxy } from '@/lib/admin-proxy'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  return adminProxy({
    method: 'POST',
    path: `/operation-requests/${encodeURIComponent(id)}/approve`,
    body,
  })
}
