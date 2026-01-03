import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // For 409 Conflict, provide a more specific error message
      let errorMessage = data.message || data.error || 'Registration failed';
      
      // Ensure errorMessage is a string
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }
      
      if (response.status === 409) {
        // Check if the backend specifies which field is duplicated
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('email')) {
          errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
        } else if (lowerMessage.includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        } else {
          errorMessage = 'Email or phone number already exists. Please use different credentials.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
