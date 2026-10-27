import { vendorProxy } from '@/lib/vendor-proxy'

export async function GET() {
  return vendorProxy({ path: '/storefronts/summary' })
}
