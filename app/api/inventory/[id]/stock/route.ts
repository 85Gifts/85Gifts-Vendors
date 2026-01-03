import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  quantity: number;
  lastUpdated?: string;
}

let inventoryData: InventoryItem[] = [
  { id: '1', quantity: 25 },
  { id: '2', quantity: 5 },
  { id: '3', quantity: 0 },
  { id: '4', quantity: 42 },
];

// PATCH /{id}/stock - Update stock quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: { quantity: number; operation?: 'add' | 'subtract' | 'set' } = await request.json();
    const { quantity, operation = 'set' } = body;

    const item = inventoryData.find(item => item.id === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (operation === 'add') {
      item.quantity += quantity;
    } else if (operation === 'subtract') {
      item.quantity = Math.max(0, item.quantity - quantity);
    } else {
      item.quantity = quantity;
    }

    item.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
