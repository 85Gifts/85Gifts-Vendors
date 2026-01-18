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

    const { searchParams } = new URL(request.url);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('page', searchParams.get('page') || '1');
    queryParams.set('limit', searchParams.get('limit') || '10');
    
    // Forward optional filter parameters
    if (searchParams.get('type')) queryParams.set('type', searchParams.get('type')!);
    if (searchParams.get('category')) queryParams.set('category', searchParams.get('category')!);
    if (searchParams.get('status')) queryParams.set('status', searchParams.get('status')!);
    if (searchParams.get('startDate')) queryParams.set('startDate', searchParams.get('startDate')!);
    if (searchParams.get('endDate')) queryParams.set('endDate', searchParams.get('endDate')!);

    const response = await fetch(`${API_URL}/api/vendor/wallet/transactions?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to fetch transactions' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Transactions API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

