import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { RESELLER_ACCESS_TOKEN_COOKIE } from '@/lib/reseller-constants'
import {
  RESELLER_API_URL,
  parseJsonResponse,
  unwrapPayload,
} from '@/lib/reseller-server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(RESELLER_ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Access token required', code: 'TOKEN_REQUIRED' },
        { status: 401 }
      )
    }

    const response = await fetch(`${RESELLER_API_URL}/api/reseller/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const payload = unwrapPayload(data)
    return NextResponse.json({
      success: true,
      data: {
        email: payload?.email,
        events: Array.isArray(payload?.events) ? payload.events : [],
      },
    })
  } catch (error) {
    console.error('Reseller me API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'ServerError',
      },
      { status: 500 }
    )
  }
}
