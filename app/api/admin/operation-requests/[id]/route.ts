import { NextRequest } from 'next/server'
import { adminProxy } from '@/lib/admin-proxy'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  return adminProxy({
    path: `/operation-requests/${encodeURIComponent(id)}`,
  })
}
