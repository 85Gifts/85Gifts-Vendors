import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  lastUpdated?: string;
}

let inventoryData: InventoryItem[] = [
  { id: '1', quantity: 25, status: 'active' },
  { id: '2', quantity: 5, status: 'active' },
  { id: '3', quantity: 0, status: 'active' },
  { id: '4', quantity: 42, status: 'active' },
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: { status: 'active' | 'inactive' | 'discontinued' } = await request.json();
    const { status } = body;

    const item = inventoryData.find(item => item.id === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    item.status = status;
    item.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Status updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
