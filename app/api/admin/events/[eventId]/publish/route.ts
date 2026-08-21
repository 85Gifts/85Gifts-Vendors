import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const { status, data } = await adminFetchHttp({
      method: 'POST',
      path: `/events/${eventId}/publish`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin publish event API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to publish event' },
      { status: 500 }
    )
  }
}