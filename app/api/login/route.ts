import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface LoginRequest {
  email: string;
  password: string;
}

interface TokenData {
  token: string;
  expires: string;
}

interface LoginSuccessResponse {
  vendor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    access: TokenData;
    refresh: TokenData;
  };
}

interface LoginErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      const errorData = data as LoginErrorResponse;
      return NextResponse.json(
        { error: errorData.message || errorData.error || errorData.detail || 'Login failed' },
        { status: response.status }
      );
    }

    // Type guard to ensure we have success response
    const successData = data as LoginSuccessResponse;

    // Store tokens in HTTP-only cookies
    const cookieStore = await cookies();
    
    if (successData.tokens?.access?.token) {
      cookieStore.set('accessToken', successData.tokens.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, 
        path: '/',
      });
    }
    
    if (successData.tokens?.refresh?.token) {
      cookieStore.set('refreshToken', successData.tokens.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      vendor: successData.vendor,
      message: 'Login successful'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
