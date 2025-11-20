import { NextRequest, NextResponse } from 'next/server';

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();

    const response = await fetch(`${process.env.API_URL}/api/vendors/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Request failed' },
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


