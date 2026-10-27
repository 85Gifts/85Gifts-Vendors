import { cookies } from 'next/headers'
import { config } from '@/config'

export const VENDOR_ACCESS_TOKEN_COOKIE = 'accessToken'

export async function getVendorAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(VENDOR_ACCESS_TOKEN_COOKIE)?.value
}

export interface VendorFetchOptions {
  method?: string
  /** Path below `/api/vendors`, e.g. `/storefronts`. */
  path?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export interface VendorFetchResult {
  status: number
  ok: boolean
  data: any
}

export function parseVendorJsonResponse(response: Response): Promise<any> {
  return response.json().catch(() => ({}))
}

/**
 * Server-only helper mirroring `adminFetchHttp`, but using the vendor
 * `accessToken` cookie and the vendor API base.
 */
export async function vendorFetchHttp(
  options: VendorFetchOptions
): Promise<VendorFetchResult> {
  const accessToken = await getVendorAccessToken()

  if (!accessToken) {
    return {
      status: 401,
      ok: false,
      data: {
        error: 'Unauthorized',
        message: 'Access token required',
        code: 'TOKEN_REQUIRED',
      },
    }
  }

  const base = config.BACKEND_URL.replace(/\/+$/, '')
  const path = options.path?.startsWith('/')
    ? options.path
    : `/${options.path ?? ''}`
  const url = new URL(`${base}/api/vendors${path}`)

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, init)
  const data = await parseVendorJsonResponse(response)

  return { status: response.status, ok: response.ok, data }
}
