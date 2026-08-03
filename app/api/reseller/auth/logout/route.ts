import { NextResponse } from 'next/server'
import { clearResellerCookies } from '@/lib/reseller-server'

export async function POST() {
  try {
    await clearResellerCookies()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reseller logout API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
