import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: 'Unauthorized - No access token' } },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/vendor/banks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            message:
              data?.error?.message ||
              data?.message ||
              data?.error ||
              'Failed to fetch bank accounts',
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Vendor banks GET API Error:', error);
    return NextResponse.json(
      { error: { message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: 'Unauthorized - No access token' } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { bankCode, bankName, accountNumber, isDefault } = body;

    if (!bankCode || !bankName || !accountNumber) {
      return NextResponse.json(
        { error: { message: 'bankCode, bankName and accountNumber are required' } },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/vendor/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        bankCode,
        bankName,
        accountNumber,
        ...(typeof isDefault === 'boolean' && { isDefault }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            message:
              data?.error?.message ||
              data?.message ||
              data?.error ||
              'Failed to add bank account',
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Vendor banks API Error:', error);
    return NextResponse.json(
      { error: { message } },
      { status: 500 }
    );
  }
}
