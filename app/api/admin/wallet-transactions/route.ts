import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

const LIST_QUERY_KEYS = [
  'page',
  'limit',
  'type',
  'category',
  'status',
  'vendorId',
  'reference',
  'startDate',
  'endDate',
  'sortBy',
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
      path: '/wallet-transactions',
      query,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin wallet transactions API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch wallet transactions' },
      { status: 500 }
    )
  }
}