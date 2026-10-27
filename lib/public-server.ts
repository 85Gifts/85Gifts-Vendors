import { config } from '@/config'

export interface PublicFetchOptions {
  method?: string
  /** Path below `/api/public`, e.g. `/storefronts`. */
  path?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Next.js fetch revalidation, in seconds. */
  revalidate?: number
  cache?: RequestCache
}

export interface PublicFetchResult {
  status: number
  ok: boolean
  data: any
  headers: Headers
}

function buildUrl(options: PublicFetchOptions): URL {
  const base = config.BACKEND_URL.replace(/\/+$/, '')
  const path = options.path?.startsWith('/')
    ? options.path
    : `/${options.path ?? ''}`
  const url = new URL(`${base}/api/public${path}`)

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url
}

/**
 * Server-only helper for the unauthenticated public API. Browser code must use
 * the same-origin proxies in `app/api/public/storefronts` instead.
 */
export async function publicFetchHttp(
  options: PublicFetchOptions
): Promise<PublicFetchResult> {
  const url = buildUrl(options)
  const headers: Record<string, string> = {}
  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }

  if (options.cache) {
    init.cache = options.cache
  } else if (options.revalidate !== undefined) {
    init.next = { revalidate: options.revalidate }
  }

  const response = await fetch(url, init)
  const data = await response.json().catch(() => ({}))

  return {
    status: response.status,
    ok: response.ok,
    data,
    headers: response.headers,
  }
}
