import { NextResponse } from 'next/server'
import { clearAdminCookies } from '@/lib/admin-server'

export async function POST() {
  try {
    await clearAdminCookies()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}