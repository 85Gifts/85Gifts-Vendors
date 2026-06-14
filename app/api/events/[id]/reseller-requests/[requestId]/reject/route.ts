import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

function getApiErrorMessage(data: any, fallback: string): string {
  const msg = data?.message
  if (typeof msg === 'string') return msg
  if (typeof msg?.message === 'string') return msg.message
  if (typeof data?.error === 'string') return data.error
  if (typeof data?.error?.message === 'string') return data.error.message
  return fallback
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Access token required', code: 'TOKEN_REQUIRED' },
        { status: 401 }
      );
    }

    const { id, requestId } = await params;
    const body = await request.json().catch(() => ({}));

    const response = await fetch(
      `${API_URL}/api/vendor/events/${id}/reseller-requests/${requestId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: getApiErrorMessage(data, 'Failed to reject request'),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Reject Reseller Request API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
