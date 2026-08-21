import { cookies } from 'next/headers'
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_ID_COOKIE,
  ADMIN_NAME_COOKIE,
  ADMIN_ROLE_COOKIE,
  ADMIN_EMAIL_COOKIE,
} from '@/lib/admin-constants'

export const ADMIN_API_URL =
  process.env.ADMIN_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'

export async function parseJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function getAdminAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value
}

export interface AdminSessionInfo {
  _id?: string
  userName?: string
  email?: string
  role?: string
}

export async function setAdminCookies(
  tokens: { accessToken?: string; refreshToken?: string },
  admin?: AdminSessionInfo
) {
  const cookieStore = await cookies()

  if (tokens.accessToken) {
    cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })
  }

  if (tokens.refreshToken) {
    cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  }

  const base = {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  }

  const id = admin?._id
  if (id) cookieStore.set(ADMIN_ID_COOKIE, id, base)
  if (admin?.userName) cookieStore.set(ADMIN_NAME_COOKIE, admin.userName, base)
  if (admin?.email) cookieStore.set(ADMIN_EMAIL_COOKIE, admin.email, base)
  if (admin?.role) cookieStore.set(ADMIN_ROLE_COOKIE, admin.role, base)
}

export async function clearAdminCookies() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(ADMIN_ID_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(ADMIN_NAME_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(ADMIN_ROLE_COOKIE, '', { maxAge: 0, path: '/' })
  cookieStore.set(ADMIN_EMAIL_COOKIE, '', { maxAge: 0, path: '/' })
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

interface AdminFetchOptions {
  method?: string
  path?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export async function adminFetchHttp(options: AdminFetchOptions): Promise<{
  status: number
  ok: boolean
  data: any
}> {
  const accessToken = await getAdminAccessToken()

  if (!accessToken) {
    return {
      status: 401,
      ok: false,
      data: { success: false, message: 'Access token required', code: 'TOKEN_REQUIRED' },
    }
  }

  const url = new URL(
    `${ADMIN_API_URL}/api/admin${options.path || ''}`
  )

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  const data = await parseJsonResponse(response)

  return { status: response.status, ok: response.ok, data }
}

export function jsonError(message: string, code?: string) {
  return { success: false, message, code }
}