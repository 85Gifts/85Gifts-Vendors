import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
}

let inventoryData: InventoryItem[] = [
  { id: '1', productId: 'prod-1', quantity: 25, reservedQuantity: 2 },
  { id: '2', productId: 'prod-2', quantity: 5, reservedQuantity: 0 },
  { id: '3', productId: 'prod-3', quantity: 0, reservedQuantity: 0 },
  { id: '4', productId: 'prod-4', quantity: 42, reservedQuantity: 1 },
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
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const availableQuantity = item.quantity - item.reservedQuantity;
    const isAvailable = availableQuantity > 0;

    return NextResponse.json({
      success: true,
      data: {
        productId: item.productId,
        totalQuantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        availableQuantity,
        isAvailable,
        inStock: item.quantity > 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
