import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  reservedQuantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  location?: string;
  variants?: any[];
  sku?: string;
  lastUpdated?: string;
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

// GET /{id} - Get inventory by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = inventoryData.find(item => item.id === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /{id} - Update inventory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<InventoryItem> = await request.json();

    const index = inventoryData.findIndex(item => item.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    inventoryData[index] = {
      ...inventoryData[index],
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: inventoryData[index],
      message: 'Inventory updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /{id} - Delete inventory
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = inventoryData.findIndex(item => item.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const deletedItem = inventoryData.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedItem,
      message: 'Inventory deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
