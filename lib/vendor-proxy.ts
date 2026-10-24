import { NextResponse } from 'next/server'
import {
  vendorFetchHttp,
  type VendorFetchOptions,
} from '@/lib/vendor-server'

/**
 * Runs a vendor API call and forwards the upstream status and body unchanged.
 * Client components and `apiClient` rely on the original status codes (401,
 * 404, 409, etc.).
 */
export async function vendorProxy(
  options: VendorFetchOptions
): Promise<NextResponse> {
  try {
    const { status, data } = await vendorFetchHttp(options)

    if (status === 204) {
      return new NextResponse(null, { status })
    }

    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('Vendor proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
