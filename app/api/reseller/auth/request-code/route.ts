import { NextRequest, NextResponse } from 'next/server'
import { RESELLER_API_URL, parseJsonResponse } from '@/lib/reseller-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(
      `${RESELLER_API_URL}/api/reseller/auth/request-code`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await parseJsonResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Reseller request-code API Error:', error)
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
