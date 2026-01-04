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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const attributes = JSON.parse(searchParams.get('attributes') || '{}');

    const item = inventoryData.find(item => item.productId === productId);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!item.variants || item.variants.length === 0) {
      return NextResponse.json(
        { error: 'No variants found for this product' },
        { status: 404 }
      );
    }

    const matchingVariants = item.variants.filter(variant => {
      return Object.keys(attributes).every(key =>
        variant.attributes[key] === attributes[key]
      );
    });

    if (matchingVariants.length === 0) {
      return NextResponse.json(
        { error: 'No matching variant found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matchingVariants[0],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
