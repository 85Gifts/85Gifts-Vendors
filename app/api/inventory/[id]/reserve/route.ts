import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  quantity: number;
  reservedQuantity: number;
  lastUpdated?: string;
}

let inventoryData: InventoryItem[] = [
  { id: '1', quantity: 25, reservedQuantity: 2 },
  { id: '2', quantity: 5, reservedQuantity: 0 },
  { id: '3', quantity: 0, reservedQuantity: 0 },
  { id: '4', quantity: 42, reservedQuantity: 1 },
];

// PATCH /{id}/reserve - Reserve stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: { quantity: number } = await request.json();
    const { quantity } = body;

    const item = inventoryData.find(item => item.id === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const availableStock = item.quantity - item.reservedQuantity;

    if (quantity > availableStock) {
      return NextResponse.json(
        { error: 'Insufficient stock available', available: availableStock },
        { status: 400 }
      );
    }

    item.reservedQuantity += quantity;
    item.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Stock reserved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
