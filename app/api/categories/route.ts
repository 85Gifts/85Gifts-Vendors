import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No access token', code: 'TOKEN_REQUIRED' },
        { status: 401 }
      )
    }

    const type = request.nextUrl.searchParams.get('type')
    const url = new URL(`${API_URL}/api/vendors/categories`)
    if (type) {
      url.searchParams.set('type', type)
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Vendor categories API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
