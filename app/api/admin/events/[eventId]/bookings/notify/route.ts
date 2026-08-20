import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()

    const { status, data } = await adminFetchHttp({
      method: 'POST',
      path: `/events/${eventId}/bookings/notify`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin notify bookings API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to notify booking customers' },
      { status: 500 }
    )
  }
}