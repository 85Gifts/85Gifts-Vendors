import { NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function GET() {
  try {
    const { status, data } = await adminFetchHttp({ path: '/dashboard/stats' })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin dashboard stats API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}