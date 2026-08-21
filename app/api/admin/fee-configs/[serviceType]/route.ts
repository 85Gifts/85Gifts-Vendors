import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    const { serviceType } = await params
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'PUT',
      path: `/fee-configs/${encodeURIComponent(serviceType)}`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin update fee config API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update fee configuration' },
      { status: 500 }
    )
  }
}