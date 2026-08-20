import { NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

export async function GET() {
  try {
    const { status, data } = await adminFetchHttp({ path: '/settlement/wallet' })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin settlement wallet API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch settlement wallet' },
      { status: 500 }
    )
  }
}