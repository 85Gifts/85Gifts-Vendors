import { cookies } from 'next/headers'
import {
  RESELLER_ACCESS_TOKEN_COOKIE,
  RESELLER_REFRESH_TOKEN_COOKIE,
} from '@/lib/reseller-constants'

export const RESELLER_API_URL =
  process.env.RESELLER_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ''

export async function parseJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function setResellerCookies(tokens: {
  accessToken: string
  refreshToken: string
}) {
  const cookieStore = await cookies()
  cookieStore.set(RESELLER_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  cookieStore.set(RESELLER_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function clearResellerCookies() {
  const cookieStore = await cookies()
  cookieStore.set(RESELLER_ACCESS_TOKEN_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(RESELLER_REFRESH_TOKEN_COOKIE, '', { maxAge: 0, path: '/' })
}

export function unwrapPayload(data: any): any {
  return data?.data?.data ?? data?.data ?? data
}

export function extractTokens(data: any): {
  accessToken?: string
  refreshToken?: string
} {
  return unwrapPayload(data)?.tokens ?? {}
}
