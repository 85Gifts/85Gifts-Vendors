import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: NextRequest) {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...rest } = body;  // ⭐ Extract product ID

  const response = await fetch(
    `${process.env.API_URL}/api/vendors/products/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rest), // Send remaining data only
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to update product" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}




// export async function DELETE(
//   request: NextRequest,
// ) {
//   try {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get('accessToken')?.value;

//     if (!accessToken) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { id, ...rest } = body;  // ⭐ Extract product ID

//     console.log("ID:", id)

//     const response = await fetch(`${process.env.API_URL}/api/vendors/products/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//       },
//     });

//     if (!response.ok) {
//       const data = await response.json();
//       return NextResponse.json(
//         { error: data.message || 'Failed to delete product' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json({ success: true, message: 'Product deleted' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 💡 Extract ID from the URL instead of JSON body
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.API_URL}/api/vendors/products/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || "Failed to delete product" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
