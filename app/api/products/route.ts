import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET - Fetch all vendor products
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.API_URL}/api/vendors/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch products' },
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

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get JSON body instead of FormData
    const body = await request.json();

    const response = await fetch(`${process.env.API_URL}/api/vendors/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json', // Send as JSON
      },
      body: JSON.stringify(body), // Send JSON instead of FormData
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract detailed validation errors if available
      let errorMessage = data.message || data.error || 'Failed to create product';
      let validationErrors = null;

      // Handle different error response formats
      if (data.details) {
        // If details is an array of errors
        if (Array.isArray(data.details)) {
          validationErrors = data.details;
          errorMessage = 'Validation failed: ' + data.details.map((err: any) => 
            err.message || err.msg || JSON.stringify(err)
          ).join(', ');
        } else if (typeof data.details === 'object') {
          // If details is an object with field-specific errors
          validationErrors = data.details;
          errorMessage = 'Validation failed: ' + Object.entries(data.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
        }
      } else if (data.errors) {
        // Handle errors array format
        if (Array.isArray(data.errors)) {
          validationErrors = data.errors;
          errorMessage = 'Validation failed: ' + data.errors.map((err: any) => 
            err.message || err.msg || JSON.stringify(err)
          ).join(', ');
        } else if (typeof data.errors === 'object') {
          validationErrors = data.errors;
          errorMessage = 'Validation failed: ' + Object.entries(data.errors)
            .map(([field, msg]: [string, any]) => `${field}: ${msg.message || msg}`)
            .join(', ');
        }
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          validationErrors: validationErrors,
          fullError: data // Include full error for debugging
        },
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

