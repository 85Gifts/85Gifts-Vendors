import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || undefined
    const { status, data } = await adminFetchHttp({
      path: '/categories',
      query: { type },
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin categories API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'POST',
      path: '/categories',
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin create category API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create category' },
      { status: 500 }
    )
  }
}
