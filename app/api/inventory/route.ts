import { NextRequest, NextResponse } from 'next/server';

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
    const body: InventoryItem = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existingIndex = inventoryData.findIndex(item => item.productId === productId);

    if (existingIndex !== -1) {
      inventoryData[existingIndex] = {
        ...inventoryData[existingIndex],
        ...body,
        lastUpdated: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        data: inventoryData[existingIndex],
        message: 'Inventory updated successfully',
      });
    }

    const newItem: InventoryItem = {
      ...body,
      id: `inv-${Date.now()}`,
      reservedQuantity: body.reservedQuantity || 0,
      status: body.status || 'active',
      lastUpdated: new Date().toISOString(),
    };

    inventoryData.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Inventory created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
