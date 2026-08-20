import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_ID_COOKIE,
  ADMIN_NAME_COOKIE,
  ADMIN_ROLE_COOKIE,
  ADMIN_EMAIL_COOKIE,
} from '@/lib/admin-constants'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Access token required', code: 'TOKEN_REQUIRED' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          _id: cookieStore.get(ADMIN_ID_COOKIE)?.value,
          userName: cookieStore.get(ADMIN_NAME_COOKIE)?.value,
          email: cookieStore.get(ADMIN_EMAIL_COOKIE)?.value,
          role: cookieStore.get(ADMIN_ROLE_COOKIE)?.value,
        },
      },
    })
  } catch (error) {
    console.error('Admin me API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}