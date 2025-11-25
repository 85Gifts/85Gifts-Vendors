import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  
  // Clear access token cookie
  cookieStore.delete('accessToken');

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
