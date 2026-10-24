import { NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

type AdminFetchOptions = Parameters<typeof adminFetchHttp>[0]

/**
 * Forwards an admin API response with its upstream status and body intact.
 */
export async function adminProxy(
  options: AdminFetchOptions
): Promise<NextResponse> {
  try {
    const { status, data } = await adminFetchHttp(options)

    if (status === 204) {
      return new NextResponse(null, { status })
    }

    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('Admin proxy error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
