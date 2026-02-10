import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const accountNumber = searchParams.get('accountNumber');
    const bankCode = searchParams.get('bankCode');

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'accountNumber and bankCode are required' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_URL}/api/paystack/resolve-account`);
    url.searchParams.set('accountNumber', accountNumber);
    url.searchParams.set('bankCode', bankCode);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || data.error || 'Failed to resolve account' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Paystack Resolve Account API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
