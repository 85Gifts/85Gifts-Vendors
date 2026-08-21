import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    const { serviceType } = await params
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'PATCH',
      path: `/fee-configs/${encodeURIComponent(serviceType)}/toggle`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin toggle fee config API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to toggle fee configuration' },
      { status: 500 }
    )
  }
}