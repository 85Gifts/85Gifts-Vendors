import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body - at minimum, items array is required
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/vendors/invoices/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = 
        (typeof errorData.error === 'object' && errorData.error?.message) 
        || errorData.error 
        || errorData.message 
        || 'Failed to generate invoice';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Check if response is a PDF (blob)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/pdf')) {
      const pdfBlob = await response.blob();
      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice.pdf"`,
        },
      });
    }

    // If not PDF, return JSON response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate Invoice PDF API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
