import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface InventoryItem {
  id?: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  reservedQuantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  location?: string;
  variants?: InventoryVariant[];
  sku?: string;
  lastUpdated?: string;
}

interface InventoryVariant {
  id?: string;
  attributes: { [key: string]: string };
  quantity: number;
  priceAdjustment?: number;
}

let inventoryData: InventoryItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    quantity: 25,
    lowStockThreshold: 10,
    reservedQuantity: 0,
    status: 'active',
    sku: 'LUX-001',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    productId: 'prod-2',
    quantity: 5,
    lowStockThreshold: 10,
    reservedQuantity: 0,
    status: 'active',
    sku: 'CHO-002',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    productId: 'prod-3',
    quantity: 0,
    lowStockThreshold: 10,
    reservedQuantity: 0,
    status: 'active',
    sku: 'PHO-003',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    productId: 'prod-4',
    quantity: 42,
    lowStockThreshold: 10,
    reservedQuantity: 0,
    status: 'active',
    sku: 'WIN-004',
    lastUpdated: new Date().toISOString(),
  },
];

// GET / - Get all inventory
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let filteredData = [...inventoryData];

    if (productId) {
      filteredData = filteredData.filter(item => item.productId === productId);
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST / - Create/update inventory
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${API_URL}/api/vendors/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to create inventory' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create Inventory API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
