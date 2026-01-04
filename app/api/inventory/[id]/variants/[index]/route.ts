import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  variants: InventoryVariant[];
}

interface InventoryVariant {
  id: string;
  attributes: { [key: string]: string };
  quantity: number;
  priceAdjustment?: number;
}

let inventoryData: InventoryItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    variants: [
      {
        id: 'v1',
        attributes: { size: 'small', color: 'red' },
        quantity: 10,
        priceAdjustment: -5,
      },
      {
        id: 'v2',
        attributes: { size: 'large', color: 'red' },
        quantity: 15,
        priceAdjustment: 0,
      },
    ],
  },
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; index: string } }
) {
  try {
    const { id, index } = params;
    const body: Partial<InventoryVariant> = await request.json();
 
    const item = inventoryData.find(item => item.productId === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const variantIndex = parseInt(index);

    if (!item.variants || variantIndex < 0 || variantIndex >= item.variants.length) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    item.variants[variantIndex] = {
      ...item.variants[variantIndex],
      ...body,
    };

    return NextResponse.json({
      success: true,
      data: item.variants[variantIndex],
      message: 'Variant updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; index: string } }
) {
  try {
    const { id, index } = params; 
    const item = inventoryData.find(item => item.productId === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const variantIndex = parseInt(index);

    if (!item.variants || variantIndex < 0 || variantIndex >= item.variants.length) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    const deletedVariant = item.variants.splice(variantIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedVariant,
      message: 'Variant removed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
