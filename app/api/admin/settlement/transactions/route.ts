import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

const LIST_QUERY_KEYS = [
  'page',
  'limit',
  'vendorId',
  'serviceType',
  'startDate',
  'endDate',
  'sortOrder',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: Record<string, string> = {}
    for (const key of LIST_QUERY_KEYS) {
      const value = searchParams.get(key)
      if (value) query[key] = value
    }

    const { status, data } = await adminFetchHttp({
      path: '/settlement/transactions',
      query,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin settlement transactions API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch settlement transactions' },
      { status: 500 }
    )
  }
}