import { NextRequest, NextResponse } from 'next/server';

interface VerifyEmailRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json();

    const response = await fetch(`${process.env.API_URL}/api/vendors/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
