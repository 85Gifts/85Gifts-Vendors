import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  variants: InventoryVariant[];
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
    variants: [
      {
        id: 'v1',
        attributes: { size: 'small', color: 'red' },
        quantity: 10,
        priceAdjustment: -5,
      },
    ],
  },
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = inventoryData.find(item => item.productId === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item.variants || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: InventoryVariant = await request.json();
    const { attributes, quantity, priceAdjustment } = body;
 
    const item = inventoryData.find(item => item.productId === id);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!item.variants) {
      item.variants = [];
    }

    const newVariant: InventoryVariant = {
      id: `v-${Date.now()}`,
      attributes,
      quantity,
      priceAdjustment,
    };

    item.variants.push(newVariant);

    return NextResponse.json({
      success: true,
      data: newVariant,
      message: 'Variant added successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
