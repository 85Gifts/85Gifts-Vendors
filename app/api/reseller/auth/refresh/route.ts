import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { RESELLER_REFRESH_TOKEN_COOKIE } from '@/lib/reseller-constants'
import {
  RESELLER_API_URL,
  parseJsonResponse,
  setResellerCookies,
  clearResellerCookies,
  extractTokens,
} from '@/lib/reseller-server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken =
      cookieStore.get(RESELLER_REFRESH_TOKEN_COOKIE)?.value

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing refresh token',
          error: 'UnauthorizedError',
        },
        { status: 401 }
      )
    }

    const response = await fetch(`${RESELLER_API_URL}/api/reseller/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      await clearResellerCookies()
      return NextResponse.json(data, { status: response.status })
    }

    const tokens = extractTokens(data)
    if (tokens.accessToken && tokens.refreshToken) {
      await setResellerCookies({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    }

    return NextResponse.json({ success: true, data: { tokens } })
  } catch (error) {
    console.error('Reseller refresh API Error:', error)
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
