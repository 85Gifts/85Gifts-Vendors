import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      // Call backend logout endpoint
      await fetch(`${process.env.API_URL}/api/vendors/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    }

    // Clear cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
