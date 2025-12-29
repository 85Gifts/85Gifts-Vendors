import { NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  quantity: number;
  lowStockThreshold: number;
  reservedQuantity: number;
}

let inventoryData: InventoryItem[] = [
  { id: '1', quantity: 25, lowStockThreshold: 10, reservedQuantity: 2 },
  { id: '2', quantity: 5, lowStockThreshold: 10, reservedQuantity: 0 },
  { id: '3', quantity: 0, lowStockThreshold: 10, reservedQuantity: 0 },
  { id: '4', quantity: 42, lowStockThreshold: 10, reservedQuantity: 1 },
];

export async function GET() {
  try {
    const totalItems = inventoryData.length;
    const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
    const totalReserved = inventoryData.reduce((sum, item) => sum + item.reservedQuantity, 0);
    const totalAvailable = totalQuantity - totalReserved;

    const lowStockCount = inventoryData.filter(
      item => item.quantity <= item.lowStockThreshold && item.quantity > 0
    ).length;

    const outOfStockCount = inventoryData.filter(item => item.quantity === 0).length;

    const summary = {
      totalItems,
      totalQuantity,
      totalReserved,
      totalAvailable,
      lowStockCount,
      outOfStockCount,
      averageStock: totalItems > 0 ? Math.round(totalQuantity / totalItems) : 0,
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
