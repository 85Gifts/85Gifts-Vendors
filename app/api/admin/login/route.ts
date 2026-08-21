import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_API_URL,
  parseJsonResponse,
  setAdminCookies,
  unwrapPayload,
  extractTokens,
} from '@/lib/admin-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${ADMIN_API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const tokens = extractTokens(data)
    const payload = unwrapPayload(data)
    const admin = payload?.admin ?? payload

    if (tokens.accessToken) {
      await setAdminCookies(tokens, admin)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: payload?.message ?? data?.data?.message ?? 'Login successful',
        admin,
      },
    })
  } catch (error) {
    console.error('Admin login API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}