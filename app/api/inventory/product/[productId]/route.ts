import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  reservedQuantity: number;
  sku?: string;
}

let inventoryData: InventoryItem[] = [
  { id: '1', productId: 'prod-1', quantity: 25, lowStockThreshold: 10, reservedQuantity: 0, sku: 'LUX-001' },
  { id: '2', productId: 'prod-2', quantity: 5, lowStockThreshold: 10, reservedQuantity: 0, sku: 'CHO-002' },
  { id: '3', productId: 'prod-3', quantity: 0, lowStockThreshold: 10, reservedQuantity: 0, sku: 'PHO-003' },
  { id: '4', productId: 'prod-4', quantity: 42, lowStockThreshold: 10, reservedQuantity: 0, sku: 'WIN-004' },
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const item = inventoryData.find(item => item.productId === productId);

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found for this product' },
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
