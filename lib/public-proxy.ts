import { NextResponse } from 'next/server'
import { publicFetchHttp } from '@/lib/public-server'

type PublicFetchOptions = Parameters<typeof publicFetchHttp>[0]

const FORWARDED_HEADERS = [
  'retry-after',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
]

/**
 * Forwards a public API response with its upstream status and body intact.
 * Rate-limit headers are passed through so the UI can explain 429 responses.
 */
export async function publicProxy(
  options: PublicFetchOptions
): Promise<NextResponse> {
  try {
    const { status, data, headers } = await publicFetchHttp({
      ...options,
      cache: 'no-store',
    })
    const responseHeaders = new Headers()
    FORWARDED_HEADERS.forEach((name) => {
      const value = headers.get(name)
      if (value) responseHeaders.set(name, value)
    })

    if (status === 204) {
      return new NextResponse(null, { status, headers: responseHeaders })
    }

    return NextResponse.json(data, { status, headers: responseHeaders })
  } catch (error) {
    console.error('Public proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to reach the storefront service.',
        code: 'UPSTREAM_ERROR',
      },
      { status: 502 }
    )
  }
}
