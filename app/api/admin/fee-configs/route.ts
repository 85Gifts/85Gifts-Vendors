import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function GET() {
  try {
    const { status, data } = await adminFetchHttp({ path: '/fee-configs' })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin fee configs API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch fee configurations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'POST',
      path: '/fee-configs',
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin create fee config API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create fee configuration' },
      { status: 500 }
    )
  }
}