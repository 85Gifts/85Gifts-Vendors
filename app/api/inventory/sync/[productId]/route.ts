import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: string;
  productId: string;
  variants: InventoryVariant[];
  lastSynced?: string;
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
    ],
  },
];

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body: { variants: InventoryVariant[] } = await request.json();
    const { variants } = body;

    const item = inventoryData.find(item => item.productId === productId);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Variants array is required' },
        { status: 400 }
      );
    }

    item.variants = variants.map((variant, index) => ({
      ...variant,
      id: variant.id || `v-${Date.now()}-${index}`,
    }));

    item.lastSynced = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: item.variants,
      message: 'Variant attributes synced successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
