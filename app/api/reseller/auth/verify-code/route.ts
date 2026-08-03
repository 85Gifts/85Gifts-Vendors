import { NextRequest, NextResponse } from 'next/server'
import {
  RESELLER_API_URL,
  parseJsonResponse,
  setResellerCookies,
  unwrapPayload,
  extractTokens,
} from '@/lib/reseller-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(
      `${RESELLER_API_URL}/api/reseller/auth/verify-code`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const tokens = extractTokens(data)
    if (tokens.accessToken && tokens.refreshToken) {
      await setResellerCookies({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    }

    const payload = unwrapPayload(data)
    return NextResponse.json({
      success: true,
      data: {
        message: payload?.message ?? 'Login successful',
        email: payload?.email ?? body.email,
        events: Array.isArray(payload?.events) ? payload.events : [],
      },
    })
  } catch (error) {
    console.error('Reseller verify-code API Error:', error)
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
