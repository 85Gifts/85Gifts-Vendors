import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const { status, data } = await adminFetchHttp({
      path: `/events/${eventId}`,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin get event API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'PUT',
      path: `/events/${eventId}`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin update event API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const { status, data } = await adminFetchHttp({
      method: 'DELETE',
      path: `/events/${eventId}`,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin delete event API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete event' },
      { status: 500 }
    )
  }
}