import { NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  sku?: string;
}

let inventoryData: InventoryItem[] = [
  { id: '1', productId: 'prod-1', quantity: 25, lowStockThreshold: 10, sku: 'LUX-001' },
  { id: '2', productId: 'prod-2', quantity: 5, lowStockThreshold: 10, sku: 'CHO-002' },
  { id: '3', productId: 'prod-3', quantity: 0, lowStockThreshold: 10, sku: 'PHO-003' },
  { id: '4', productId: 'prod-4', quantity: 42, lowStockThreshold: 10, sku: 'WIN-004' },
];

export async function GET() {
  try {
    const outOfStockItems = inventoryData.filter(item => item.quantity === 0);

    return NextResponse.json({
      success: true,
      data: outOfStockItems,
      total: outOfStockItems.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
